define([
  "underscore",
  "jquery",
  "backbone",
  "libs/FieldDBBackboneModel",
  "libs/compiled_handlebars",
  "app/AppView",
  "activity/Activity",
  "authentication/Authentication",
  "corpus/Corpus",
  "corpus/CorpusMask",
  "corpus/Corpuses",
  "data_list/DataList",
  "datum/DatumField",
  "datum/DatumFields",
  "search/Search",
  "datum/Session",
  "app/AppRouter",
  "confidentiality_encryption/Confidential",
  "user/User",
  "user/UserMask",
  "text!locales/en/messages.json",
  "OPrime"
], function(
  _,
  jQuery,
  Backbone,
  FieldDBBackboneModel,
  Handlebars,
  AppView,
  Activity,
  Authentication,
  Corpus,
  CorpusMask,
  Corpuses,
  DataList,
  DatumField,
  DatumFields,
  Search,
  Session,
  AppRouter,
  Confidential,
  User,
  UserMask,
  LocaleData
) {
  var App = FieldDBBackboneModel.extend( /** @lends App.prototype */ {
    /**
     * @class The App handles the reinitialization and loading of the app
     *        depending on which platform (Android, Chrome, web) the app is
     *        running, who is logged in etc.
     *
     * The App should be serializable to save state to local storage for the
     * next run.
     *
     * @property {Authentication} authentication The auth member variable is an
     *           Authentication object permits access to the login and logout
     *           functions, and the database of users depending on whether the
     *           app is online or not. The authentication is the primary way to access the current user.
     *
     * @property {Corpus} corpus The corpus is a Corpus object which will permit
     *           access to the datum, the data lists and the sessions. The corpus feeds the
     *           search object with indexes and fields for advanced search, the
     *           corpus has datalists, has teams with permissions, has a
     *           confidentiality_encryption key, it's datum have sessions, its
     *           datalists and datum have export.
     *
     * @property {Search} search The current search details.
     *
     * @property {Session} currentSession The session that is currently open.
     *
     * @property {DataList} currentDataList The datalist that is currently open.
     *
     * @extends Backbone.Model
     * @constructs
     */
    globalEvents: {
      'dashboard:load:success': function() {
        if (OPrime.debugMode) OPrime.debug(arguments);
        this.set("loaded", true);
      },
      'dashboard:load:fail': function() {
        if (OPrime.debugMode) OPrime.debug(arguments);
        this.set("loaded", false);
      }
    },

    prepLocales: function() {
      window.Locale = {};
      window.Locale.get = function(message) {
        if (!window.Locale.data[message]) {
          return message;
        }
        return window.Locale.data[message].message;
      };
      if (LocaleData) {
        window.Locale.data = JSON.parse(LocaleData);
      } else {
        console.log("Locales did not load.");
        window.Locale.get = function(message) {
          return message;
        };
      }
    },

    fillWithDefaults: function() {
      // If there's no authentication, create a new one
      if (!this.get("authentication")) {
        this.set("authentication", new Authentication({
          filledWithDefaults: true
        }));
      }
      this.showSpinner();

      this.prepLocales();

      /*
       * Start the pub sub hub
       */
      if (!window.hub || typeof window.hub.subscribe !== "function") {
        window.hub = {};
        OPrime.makePublisher(window.hub);
      }

      /*
       * Load the user
       */
      window.app = this;

      var appself = this;
      if (OPrime.debugMode) OPrime.debug("Loading user");

      $(".spinner-status").html("Loading user...");
      var username = localStorage.getItem("username");
      var u = localStorage.getItem(username);
      // Support version > 4.6.5
      if (!u) {
        u = localStorage.getItem("encryptedUser");
      }
      window.onbeforeunload = this.warnUserAboutSavedSyncedStateBeforeUserLeaves;

      appself.get("authentication").loadEncryptedUser(u, function(success, errors) {

        $(".spinner-status").html("Turning on continuous sync with your team server...");
        appself.replicateContinuouslyWithCouch(function() {
          /*
           * Load the backbone objects
           */
          if (OPrime.debugMode) OPrime.debug("Creating backbone objects");
          $(".spinner-status").html("Building dashboard objects...");
          appself.createAppBackboneObjects(appself.get("connection").dbname, function() {

            /*
             * If you know the user, load their most recent
             * dashboard
             */
            if (OPrime.debugMode) OPrime.debug("Loading the backbone objects");
            $(".spinner-status").html("Loading dashboard objects...");
            appself.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appself.get("authentication").get("userPrivate").get("mostRecentIds"), function() {

              if (OPrime.debugMode) OPrime.debug("Starting the app");
              appself.startApp(function() {
                window.app.showHelpOrNot();
                appself.stopSpinner();
                window.app.router.renderDashboardOrNot(true);
                Backbone.trigger('dashboard:load:success');
              });
            });
          });
        });
      });
    },

    // Internal models: used by the parse function
    internalModels: {
      corpus: Corpus,
      authentication: Authentication,
      currentSession: Session,
      currentDataList: DataList,
      search: Search
    },

    originalParse: Backbone.Model.prototype.parse,
    parse: function(originalModel) {
      /* if this is just a couchdb save result, dont process it */
      if (originalModel.ok) {
        return this.originalParse(originalModel);
      }

      if (!originalModel.brandLowerCase) {
        var connection = FieldDB.Connection.defaultConnection();
        originalModel = {
          brandLowerCase: connection.brandLowerCase
        };
      }

      // originalModel.authentication = originalModel.authentication || {};
      FieldDB.FieldDBObject.application = new FieldDB.App(originalModel);
      return this.originalParse(originalModel);
    },

    /*
     * This will be the only time the app should open the pouch.
     */
    changePouch: function(connection, callback) {
      if (!connection || connection == undefined) {
        throw new Error("The app cannot function without knowing which database is in use.");
      }

      OPrime.debug("App.changePouch setting connection: ", connection);

      connection.dbname = connection.dbname || connection.pouchname;
      this.set("connection", connection);
      var urlPrefix = OPrime.getCouchUrl(this.get("connection"), "");

      try {
        var pieces = window.location.pathname.replace(/^\//, "").split("/");
        //Handle McGill server which runs out of a virtual directory
        if (pieces[0] == "corpus") {
          urlPrefix = window.location.hostname + "/corpus";
        }
      } catch (e) {
        console.log(e);
        OPrime.bug("Couldn't set the databse name off of the url, please report this.");
      }

      Backbone.couch_connector.config.base_url = jQuery.couch.urlPrefix = urlPrefix;
      Backbone.couch_connector.config.db_name = connection.dbname;

      FieldDBBackboneModel.prototype.changePouch.apply(this, arguments);
    },
    /**
     * This function creates the backbone objects, and links them up so that
     * they are ready to be used in the views. This function should be called on
     * app load, either by main, or by welcome new user. This function should
     * not be called at any later time as it will break the connection between
     * the views and the models. To load different models into the app after it
     * has first loaded, use the loadBackboneObjectsById function below.
     *
     * @param callback
     */
    createAppBackboneObjects: function(optionaldbname, callback) {
      console.log("TOOD Use the fielddb app to load the dashboard");
      var fieldDBApp = {
        connection: this.get("connection")
      };
      this.parse(fieldDBApp);

      if (optionaldbname == null) {
        optionaldbname == "default";
      }

      if (Backbone.couch_connector.config.db_name == "default") {
        OPrime.bug("The app doesn't know which database its in. This is a problem.");
      }

      if (this.get("authentication").get("userPublic") == undefined) {
        this.get("authentication").set("userPublic", new UserMask({
          dbname: optionaldbname
        }));
      }
      if (this.get("authentication").get("userPrivate") == undefined) {
        this.get("authentication").set("userPrivate", new User());
      }
      var c = new Corpus({
        dbname: optionaldbname
      });
      this.set("corpus", c);

      this.set("currentSession", new Session({
        dbname: optionaldbname,
      }));

      this.set("currentDataList", new DataList({
        dbname: optionaldbname
      }));

      this.set("search", new Search({
        dbname: optionaldbname
      }));

      if (typeof callback == "function") {
        callback();
      }
    },

    startApp: function(callback) {
      if (!window.appView) {
        window.appView = new AppView({
          model: this
        });
        /* Tell the app to render everything */
        window.appView.render();
      }

      if (typeof window.app.router == "function") {
        /* Tell the router to render the home screen divs */
        this.router = new AppRouter();
        this.router.renderDashboardOrNot(true);

        Backbone.history.start();
        if (typeof callback == "function") {
          if (OPrime.debugMode) OPrime.debug("Calling back the startApps callback");
          callback();
        }
      }

    },

    showSpinner: function() {
      $('#dashboard_loading_spinner').html("<img class='spinner-image' src='images/loader.gif'/><p class='spinner-status'>Loading dashboard...</p>");
      $('.spinner-image').css({
        'width': function() {
          return ($(document).width() * .1) + 'px';
        },
        'height': function() {
          return ($(document).width() * .1) + 'px';
        },
        'padding-top': '10em'
      });
    },
    stopSpinner: function() {
      $('#dashboard_loading_spinner').html("");
    },
    backUpUser: function(callback, cancelcallback) {
      var self = this;
      /* don't back up the public user, its not necessary the server doesn't modifications anyway. */
      if (self.get("authentication").get("userPrivate").get("username") == "public" || self.get("authentication").get("userPrivate").get("username") == "lingllama") {
        if (typeof callback == "function") {
          callback();
        }
        return;
      }
      this.saveAndInterConnectInApp(function() {
        //syncUserWithServer will prompt for password, then run the corpus replication.
        self.get("authentication").syncUserWithServer(function() {
          if (window.appView) {
            window.appView.toastUser("Backed up your user preferences with your authentication server, if you log into another device, your preferences will load.", "alert-info", "Backed-up:");
          }
          if (typeof callback == "function") {
            callback();
          }
        }, null, cancelcallback);
      }, cancelcallback);
    },

    /**
     * Log the user into their corpus server automatically using cookies and post so that they can replicate later.
     * "http://localhost:5984/_session";
     *
     * References:
     * http://guide.couchdb.org/draft/security.html
     *
     * @param username this can come from a username field in a login, or from the User model.
     * @param password this comes either from the UserWelcomeView when the user logs in, or in the quick authentication view.
     * @param callback A function to call upon success, it receives the data back from the post request.
     */
    logUserIntoTheirCorpusServer: function(connection, username,
      password, succescallback, failurecallback) {
      if (connection == null || connection == undefined) {
        connection = this.get("connection");
      }
      if (connection == null || connection == undefined) {
        alert("Bug: i couldnt log you into your couch database.");
      }

      /* if on android, turn on replication and don't get a session token */
      if (OPrime.isTouchDBApp()) {
        Android.setCredentialsAndReplicate(connection.dbname,
          username, password, connection.domain);
        OPrime
          .debug("Not getting a session token from the users corpus server " +
            "since this is touchdb on android which has no idea of tokens.");
        if (typeof succescallback == "function") {
          succescallback();
        }
        return;
      }

      var couchSessionUrl = this.getCouchUrl(connection, "/_session");
      if (OPrime.debugMode) OPrime.debug("Contacting your corpus server ", connection, couchSessionUrl);

      var appself = this;
      var connectionInscope = connection;
      jQuery.couch.urlPrefix = couchSessionUrl.replace("/_session", "");

      FieldDB.CORS.makeCORSRequest({
        type: "POST",
        url: couchSessionUrl,
        data: {
          name: username,
          password: password
        }
      }).then(function(serverResults) {

        appself.get("authentication").get("userPrivate").updateListOfCorpora(serverResults.roles);
        // var corpora =  window.app.get("corporaUserHasAccessTo")  || new Corpuses();
        // var roles = serverResults.roles;
        // for (var role in roles) {
        //   var thisConnection = JSON.parse(JSON.stringify(connectionInscope));
        //   thisConnection.corpusid = "";
        //   thisConnection.dbname = roles[role].replace(/_admin|_writer|_reader|_commenter|fielddbuser/g, "");
        //   thisConnection.title = thisConnection.dbname;
        //   if (thisConnection.title.length > 30) {
        //     thisConnection.title = thisConnection.title.replace(username + "-", "");
        //   }
        //   if (thisConnection.title.length > 30) {
        //     thisConnection.title = thisConnection.title.substring(0, 10) + "..." + thisConnection.title.substring(thisConnection.title.length - 15, thisConnection.title.length - 1);
        //   }
        //   thisConnection.id = thisConnection.dbname;
        //   if (thisConnection.dbname.length > 4 && thisConnection.dbname.split("-").length === 2) {
        //     if (corpora.where({
        //       "dbname": thisConnection.dbname
        //     }).length === 0) {
        //       corpora.push(new CorpusMask(thisConnection));
        //     } else {
        //       console.log(thisConnection.dbname + " Already known");
        //     }
        //   }
        // }
        // window.app.set("corporaUserHasAccessTo", corpora);
        // localStorage.setItem(username + "corporaUserHasAccessTo", JSON.stringify(corpora.toJSON()));

        if (window.appView) {
          window.appView
            .toastUser("I logged you into your team server automatically, your syncs will be successful.", "alert-info", "Online Mode:");
        }

        /* if in chrome extension, or offline, turn on replication */
        if (OPrime.isChromeApp()) {
          //TODO turn on pouch and start replicating and then redirect user to their user page(?)
          //            appself.replicateContinuouslyWithCouch();
        }

        if (typeof succescallback == "function") {
          succescallback(serverResults);
        }

      }, function(reason) {

        if (window.appView) {
          window.appView
            .toastUser(
              "I couldn't log you into your corpus. What does this mean? " + "This means you can't upload data to train an auto-glosser or visualize your morphemes. " + "You also can't share your data with team members. If your computer is online and you are" +
              " using the Chrome Store app, then this probably the side effect of a bug that we might not know about... please report it to us :) " + OPrime.contactUs + " If you're offline you can ignore this warning, and sync later when you're online. ",
              "alert-danger",
              "Offline Mode:");
        }
        if (typeof failurecallback == "function") {
          failurecallback("I couldn't log you into your corpus.");
        }
        if (OPrime.debugMode) OPrime.debug(reason);
        window.app.get("authentication").set(
          "staleAuthentication", true);

      }).fail(function(exception) {

        console.warn(exception.stack);
        OPrime.bug("There was a problem logging you into your database, please report this.");
        if (typeof failurecallback == "function") {
          failurecallback("Unexpected error when logging you in to your corpus.");
        }

      });
    },
    getCouchUrl: function(connection, couchdbcommand) {
      if (!connection) {
        connection = this.get("connection");
        if (OPrime.debugMode) OPrime.debug("Using the apps cconnection", connection);
      } else {
        connection.dbname = connection.dbname || connection.pouchname;
        if (OPrime.debugMode) OPrime.debug("Using the connection passed in,", connection, this.get("connection"));
      }
      if (!connection) {
        OPrime.bug("The couch url cannot be guessed. It must be provided by the App. Please report this bug.");
      }
      return OPrime.getCouchUrl(connection, couchdbcommand);
    },
    /**
     * Synchronize to server and from database.
     */
    replicateContinuouslyWithCouch: function(successcallback,
      failurecallback) {
      var self = this;
      if (!self.pouch) {
        if (OPrime.debugMode) OPrime.debug("Not replicating, no pouch ready.");
        if (typeof successcallback == "function") {
          successcallback();
        }
        return;
      }
      self.pouch(function(err, db) {
        var couchurl = this.getCouchUrl();
        if (err) {
          if (OPrime.debugMode) OPrime.debug("Opening db error", err);
          if (typeof failurecallback == "function") {
            failurecallback();
          } else {
            alert('Opening DB error' + JSON.stringify(err));
            if (OPrime.debugMode) OPrime.debug('Opening DB error' + JSON.stringify(err));
          }
        } else {
          if (OPrime.debugMode) OPrime.debug("Opening db success", db);
          alert("TODO check to see if  needs a slash if replicating with pouch on " + couchurl);
          self.replicateFromCorpus(db, couchurl, function() {
            //turn on to regardless of fail or succeed
            self.replicateToCorpus(db, couchurl);
          }, function() {
            //turn on to regardless of fail or succeed
            self.replicateToCorpus(db, couchurl);
          });

          if (typeof successcallback == "function") {
            successcallback();
          }

        }
      });

    },
    /**
     * Pull down corpus to offline pouch, if its there.
     */
    replicateOnlyFromCorpus: function(connection, successcallback, failurecallback) {
      var self = this;

      if (!self.pouch) {
        if (OPrime.debugMode) OPrime.debug("Not replicating, no pouch ready.");
        if (typeof successcallback == "function") {
          successcallback();
        }
        return;
      }

      self.pouch(function(err, db) {
        var couchurl = self.getCouchUrl();
        if (err) {
          if (OPrime.debugMode) OPrime.debug("Opening db error", err);
          if (typeof failurecallback == "function") {
            failurecallback();
          } else {
            alert('Opening DB error' + JSON.stringify(err));
            if (OPrime.debugMode) OPrime.debug('Opening DB error' + JSON.stringify(err));
          }
        } else {
          db.replicate.from(couchurl, {
            continuous: false
          }, function(err, response) {
            if (OPrime.debugMode) OPrime.debug("Replicate from " + couchurl, response, err);
            if (err) {
              if (typeof failurecallback == "function") {
                failurecallback();
              } else {
                alert('Corpus replicate from error' + JSON.stringify(err));
                if (OPrime.debugMode) OPrime.debug('Corpus replicate from error' + JSON.stringify(err));
              }
            } else {
              if (OPrime.debugMode) OPrime.debug("Corpus replicate from success", response);
              if (typeof successcallback == "function") {
                successcallback();
              }
            }
          });
        }
      });
    },
    replicateToCorpus: function(db, couchurl, success, failure) {
      db.replicate.to(couchurl, {
        continuous: true
      }, function(err, response) {
        if (OPrime.debugMode) OPrime.debug("Replicated to " + couchurl);
        if (OPrime.debugMode) OPrime.debug(response);
        if (OPrime.debugMode) OPrime.debug(err);
        if (err) {
          if (OPrime.debugMode) OPrime.debug("replicate to db  error", err);
          if (typeof failure == "function") {
            failure();
          } else {
            alert('Database replicate to error' + JSON.stringify(err));
            if (OPrime.debugMode) OPrime.debug('Database replicate to error' + JSON.stringify(err));
          }
        } else {
          if (OPrime.debugMode) OPrime.debug("Database replicate to success", response);
          if (typeof success == "function") {
            success();
          } else {
            if (OPrime.debugMode) OPrime.debug('Database replicating' + JSON.stringify(connection));
          }

        }
      });
    },
    replicateFromCorpus: function(db, couchurl, succes, fail) {
      db.replicate
        .from(couchurl, {
            continuous: true
          },
          function(err, response) {
            if (OPrime.debugMode) OPrime.debug("Replicated from " + couchurl);
            if (OPrime.debugMode) OPrime.debug(response);
            if (OPrime.debugMode) OPrime.debug(err);
            if (err) {
              if (OPrime.debugMode) OPrime.debug("replicate from db  error", err);
              if (typeof fail == "function") {
                fail();
              } else {
                alert('Database replicate from error' + JSON.stringify(err));
                if (OPrime.debugMode) OPrime.debug('Database replicate from error' + JSON.stringify(err));
              }
            } else {
              if (OPrime.debugMode) OPrime.debug("Database replicate from success",
                response);
              if (typeof succes == "function") {
                succes();
              } else {
                if (OPrime.debugMode) OPrime.debug('Database replicating' + JSON.stringify(connection));
              }

            }
          });
    },

    loadBackboneObjectsByIdAndSetAsCurrentDashboard: function(appids, callback) {
      if (OPrime.debugMode) OPrime.debug("loadBackboneObjectsByIdAndSetAsCurrentDashboard");

      if (appids && appids.connection) {
        appids.connection = new FieldDB.Connection(appids.connection);
      }

      /*
       * Verify that the user is in their database, and that the
       * backbone couch adaptor is saving to the corpus' database,
       * not where the user currently is.
       */
      if (OPrime.isCouchApp()) {
        var corpusdbname = appids.connection.dbname;
        if (window.location.href.indexOf(corpusdbname) == -1) {
          if (corpusdbname != "public-firstcorpus") {
            var username = "";
            try {
              username = window.app.get("authentication").get("userPrivate").get("username") || "";
            } catch (e) {
              //do nothing
            }
            if (username != "public") {
              OPrime.bug("You're not in the database for your most recent corpus. Please authenticate and then we will take you to your database...");
            }
          }
          var optionalRedirectDomain = OPrime.guessRedirectUrlBasedOnWindowOrigin("public-firstcorpus");
          OPrime.redirect(optionalRedirectDomain + "user.html#login/" + corpusdbname);

          //        window.app.get("authentication").syncUserWithServer(function(){
          //        OPrime.redirect(optionalRedirectDomain+"corpus.html");
          //        });
          return;
        }
      }

      var connection = appids.connection;
      var corpusid = connection.corpusid || appids.corpusid;

      var c = new Corpus({
        "dbname": connection.dbname,
        "connection": connection.toJSON()
      });
      var selfapp = this;
      if (!corpusid) {
        if (this.get("corpus").id) {
          corpusid = this.get("corpus").id;
        } else {
          $(".spinner-status").html("Opening/Creating Corpus...");
          this.get("corpus").loadOrCreateCorpusBydbname(connection, function() {
            /* if the corpusid is missing, make sure there are other objects in the dashboard */
            selfapp.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids, callback);
            //          window.app.stopSpinner();
          });
          return;
        }
      }
      c.id = corpusid;

      var fetchCorpusSucess = function(corpusModel) {
        if (OPrime.debugMode) OPrime.debug("Corpus fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard", corpusModel);
        /* Upgrade chrome app user corpora's to v1.38+ */
        var oldConnection = corpusModel.get("connection");
        if (oldConnection) {
          corpusModel.set("connection", new FieldDB.Connection(oldConnection).toJSON());
        }

        $(".spinner-status").html("Opened Corpus...");
        c.setAsCurrentCorpus(function() {
          $(".spinner-status").html("Loading Corpus...");

          /*
           * Fetch sessions and datalists
           */
          c.datalists.fetchDatalists();
          c.sessions.fetchSessions();
          c.fetchPublicSelf();

          var dl = new DataList({
            "dbname": connection.dbname
          });
          dl.id = appids.datalistid;
          dl.fetch({
            success: fetchDatalistSucess,
            error: fetchDatalistError
          });
        });
      };
      var fetchCorpusError = function(model, error, options) {
        if (OPrime.debugMode) OPrime.debug("There was an error fetching corpus ", model, error, options);

        if (error.status === 404) {
          alert("Unable to open your corpus. Please try again on the user page.");
          // OPrime.redirect("user.html#login/" + connection.dbname);
          return;
        }

        var reason = "";
        if (error.reason) {
          reason = error.reason.message || error.reason || "";
        }

        var originalCallbackFromLoadBackboneApp = callback;
        if (reason.indexOf("not authorized") >= 0 || reason.indexOf("nauthorized") >= 0) {
          //Show quick authentication so the user can get their corpus token and get access to the data
          window.app.get("authentication").syncUserWithServer(function() {
            if (OPrime.debugMode) OPrime.debug("Trying to reload the app after a session token has timed out");
            self.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids, originalCallbackFromLoadBackboneApp);
          }, connection.dbname);
          //            var optionalRedirectDomain = OPrime.guessRedirectUrlBasedOnWindowOrigin("public-firstcorpus");
          //            OPrime.redirect(optionalRedirectDomain+"corpus.html#login");
          return;
        }

        if (!window.navigator.onLine) {
          OPrime.bug("You appear to be offline. Version 1-40 work offline, versions 41-46 are online only.");
          return;
        }

        if (reason.indexOf("nexpected end of input") >= 0) {
          OPrime.bug("Unable to contact the server, please report this.");
        }
        // window.app.get("authentication").syncUserWithServer(function() {
        //   console.log("Trying to reload the app after a session token has timed out, or the users account was moved to another server in v1.90");
        //   self.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids, originalCallbackFromLoadBackboneApp);
        // }, connection.dbname);
      };
      var fetchDatalistSucess = function(dataListModel) {
        $(".spinner-status").html("Opened DataList...");

        if (OPrime.debugMode) OPrime.debug("Data list fetched successfully", dataListModel);
        dataListModel.setAsCurrentDataList(function() {
          $(".spinner-status").html("Loading your most recent DataList, " + dataListModel.get("datumIds").length + " entries...");

          var s = new Session({
            "dbname": connection.dbname
          });
          s.id = appids.sessionid;
          if (!s.id) {
            if (c.sessions.models && c.sessions.models[0] && c.sessions.models[0].id) {
              s.id = c.sessions.models[0].id;
            } else {
              s.set(
                "sessionFields", window.app.get("corpus").get("sessionFields").clone()
              );
              fetchSessionSucess(s);
              return;
            }
          }
          s.fetch({
            success: fetchSessionSucess,
            error: fetchSessionError
          });
        });
      };
      var fetchDatalistError = function(model, error, options) {
        delete appids.datalistid;
        if (c.datalists.models && c.datalists.models[0] && c.datalists.models[0].id) {
          appids.datalistid = c.datalists.models[0].id;
          fetchDatalistSucess(c.datalists.models[0]);
        } else {
          alert("There was an error fetching the data list. " + error.reason);
        }
      };
      var fetchSessionSucess = function(loadedSession) {
        $(".spinner-status").html("Opened Elicitation Session...");
        if (OPrime.debugMode) OPrime.debug("Session fetched successfully", loadedSession);
        loadedSession.setAsCurrentSession(function() {
          $(".spinner-status").html("Loading Elicitation Session...");
          if (OPrime.debugMode) OPrime.debug("Entire dashboard fetched and loaded and linked up with views correctly.");
          if (window.appView) {
            window.appView.toastUser("Your dashboard has been loaded from where you left off last time.", "alert-success", "Dashboard loaded!");
          }
          try {
            window.app.set("corporaUserHasAccessTo", new Corpuses(JSON.parse(localStorage.getItem(
              window.app.get("authentication").get("userPrivate").get("username") + "corporaUserHasAccessTo"))));
          } catch (e) {
            console.log("Couldn't load the list of corpora which the user has access to.");
          }
          /*
           * After all fetches have succeeded show the pretty dashboard, the objects have already been linked up by their setAsCurrent methods
           */
          $(".spinner-status").html("Rendering Dashboard...");

          window.app.stopSpinner();
          if (typeof callback == "function") {
            callback();
          }
        }, function() {
          alert("Failure to set as current session in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
        });
      };

      var fetchSessionError = function(model, error, options) {
        delete appids.sessionid;
        if (c.sessions.models && c.sessions.models[0] && c.sessions.models[0].id) {
          appids.sessionid = c.sessions.models[0].id;
          fetchSessionSucess(c.sessions.models[0]);
          return;
        }
        // alert("There was an error fetching the session. " + error.reason);
        var s = new Session({
          "dbname": connection.dbname
        });
        s.set(
          "fields", window.app.get("corpus").get("sessionFields").clone()
        );
        s.id = s.id + "sessionDetailsWereMissing";
        fetchSessionSucess(s);
      };

      // Change pouch and stat the fetch
      this.changePouch(connection, function() {
        c.fetch({
          success: fetchCorpusSucess,
          error: fetchCorpusError
        });
      });
    },

    router: AppRouter,

    showHelpOrNot: function() {
      //Dont show help
      return;

      var username = this.get("authentication").get("userPrivate").get("username");
      if (username == "public") {
        //Dont show the help screen for the public user
        return;
      }
      var helpShownCount = localStorage.getItem(username + "helpShownCount") || 0;
      var helpShownTimestamp = localStorage
        .getItem(username + "helpShownTimestamp") || 0;

      /*
       * dont show the guide immediately if they are truely a new
       * user, let them see the dashboard before they wonder how
       * to use it. 60 seconds later, show the help.
       */
      if (helpShownTimestamp == 0) {
        $(".help_count_reason").html("Just in case you were wondering what all those buttons are for, check out Gretchen's Illustrated Guide to your dashboard! ");

        $(".help_count_left").html(3 - helpShownCount);
        localStorage.setItem(username + "helpShownCount", ++helpShownCount);
        localStorage.setItem(username + "helpShownTimestamp", Date.now());
        window.setTimeout(function() {
          window.app.router.navigate("help/illustratedguide", {
            trigger: true
          });
        }, 60000);
        return;
      }

      /*
       * If this is not a brand new user:
       */
      var milisecondsSinceLastHelp = Date.now() - helpShownTimestamp;

      /* if its been more than 5 days, reset the help shown count to trigger the illustrated guide */
      if (milisecondsSinceLastHelp > 432000000 && helpShownTimestamp != 0) {
        helpShownCount = 0;
        $(".help_count_reason").html("Welcome back! It's been more than 5 days since you opened the app. ");
      }
      if (helpShownCount > 3) {
        // do nothing
      } else {
        $(".help_count_left").html(3 - helpShownCount);
        localStorage.setItem(username + "helpShownCount", ++helpShownCount);
        localStorage.setItem(username + "helpShownTimestamp", Date.now());
        window.app.router.navigate("help/illustratedguide", {
          trigger: true
        });
      }
    },

    /**
     * This function is used to save the entire app state that is needed to load when the app is re-opened.
     * http://stackoverflow.com/questions/7794301/window-onunload-is-not-working-properly-in-chrome-browser-can-any-one-help-me
     *
     * $(window).on('beforeunload', function() {
        return 'Your own message goes here...';
      });
     */
    warnUserAboutSavedSyncedStateBeforeUserLeaves: function(e) {
      var returntext = "";
      if (window.appView) {
        if (window.appView.totalUnsaved.length >= 1) {
          returntext = "You have unsaved changes, click cancel to save them. \n\n";
        }
        if (window.appView.totalUnsaved.length >= 1) {
          returntext = returntext + "You have unsynced changes, click cancel and then click the sync button to sync them. This is only important if you want to back up your data or if you are sharing your data with a team. \n\n";
        }
      }
      if (returntext == "") {
        return; //don't show a pop up
      } else {
        return "Either you haven't been using the app and Chrome wants some of its memory back, or you want to leave the app.\n\n" + returntext;
      }
    },
    /**
     * Saves a json file via REST to a couchdb, must be online.
     *
     * @param bareActivityObject
     */
    addActivity: function(bareActivityObject) {
      bareActivityObject.verb = bareActivityObject.verb.replace("href=", "target='_blank' href=");
      bareActivityObject.directobject = bareActivityObject.directobject.replace("href=", "target='_blank' href=");
      bareActivityObject.indirectobject = bareActivityObject.indirectobject.replace("href=", "target='_blank' href=");
      bareActivityObject.context = bareActivityObject.context.replace("href=", "target='_blank' href=");

      if (OPrime.debugMode) OPrime.debug("Saving activity: ", bareActivityObject);
      var backboneActivity = new Activity(bareActivityObject);

      var connection = this.get("connection");
      var activitydb = connection.dbname + "-activity_feed";
      if (bareActivityObject.teamOrPersonal != "team") {
        activitydb = this.get("authentication").get("userPrivate").get("username") + "-activity_feed";
        backboneActivity.attributes.user.gravatar = this.get("authentication").get("userPrivate").get("gravatar");
      }
      var couchurl = OPrime.getCouchUrl(connection, "/" + activitydb);

      FieldDB.CORS.makeCORSRequest({
        type: 'POST',
        withCredentials: true,
        url: couchurl,
        data: backboneActivity.toJSON()
      }).then(function(resp) {
        if (OPrime.debugMode) OPrime.debug("Successfully saved activity to your activity couch.", resp);
      }, function(e, f, g) {
        if (OPrime.debugMode) OPrime.debug("Error saving activity", e, f, g);
        localStorage.setItem("activity" + Date.now(), backboneActivity.toJSON());
      });

      //      if (bareActivityObject.get("teamOrPersonal") == "team") {
      //        window.app.get("currentCorpusTeamActivityFeed").addActivity(bareActivityObject);
      //      } else {
      //        window.app.get("currentUserActivityFeed").addActivity(bareActivityObject);
      //      }
    },

    /**
     * This function sequentially saves first the session, datalist and then corpus. Its success callback is called if all saves succeed, its fail is called if any fail.
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp: function(successcallback, failurecallback) {
      if (!failurecallback) {
        failurecallback = function() {
          alert("There was a bug/problem in the saveAndInterConnectInApp in App.js, somewhere along the save call. The Session is saved first, if it succeeds, then the datalist, then the corpus. The failure is somewhere along there.");
        };
      }
      var appSelf = this;
      appSelf.get("currentSession").saveAndInterConnectInApp(function() {
        appSelf.get("currentDataList").saveAndInterConnectInApp(function() {
          appSelf.get("corpus").saveAndInterConnectInApp(function() {
            appSelf.get("authentication").saveAndInterConnectInApp(function() {

              appSelf.get("authentication").staleAuthentication = true;
              //              localStorage.setItem("mostRecentDashboard", JSON.stringify(window.app.get("authentication").get("userPrivate").get("mostRecentIds")));
              if (window.appView) {
                window.appView.toastUser("Your dashboard has been saved, you can exit the app at anytime and return to this state.", "alert-success", "Exit at anytime:");
              }

              //appSelf.router.showDashboard();
              if (typeof successcallback == "function") {
                successcallback();
              }

            }, failurecallback);
          }, failurecallback);
        }, failurecallback);
      }, failurecallback);
    }

  });

  return App;
});
