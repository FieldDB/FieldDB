var FieldDBObject = require('./../FieldDBObject').FieldDBObject;
var Activity = require('./../activity/Activity').Activity;
var Authentication = require('./../FieldDBObject').FieldDBObject;
var Corpus = require('./../corpus/Corpus').Corpus;
var DataList = require('./../data_list/DataList').DataList;
var DatumField = require('./../datum/DatumField').DatumField;
var DatumFields = require('./../datum/DatumFields').DatumFields;
var Search = require('./../search/Search').Search;
var Session = require('./../datum/Session').Session;
var Router = require('./../Router').Router;
var Confidential = require('./../confidentiality_encryption/Confidential').Confidential;
var User = require('./../user/User').User;
var UserMask = require('./../user/UserMask').UserMask;
var Contextualizer = require('./../locales/Contextualizer').Contextualizer;
var EnglishContextMessages = require('./../locales/en/messages.json').EnglishContextMessages;
var SpanishContextMessages = require('./../locales/es/messages.json').SpanishContextMessages;

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
 * @extends FieldDBObject
 * @constructs
 */
var App = function App(options) {
  this.debug("Constructing App ", options);
  FieldDBObject.apply(this, arguments);
};

App.prototype = Object.create(FieldDBObject.prototype, /** @lends App.prototype */ {
  constructor: {
    value: App
  },

  fillWithDefaults: {
    value: function() {
      var self = this;

      // If there's no authentication, create a new one
      if (!this.get("authentication")) {
        this.set("authentication", new Authentication({
          filledWithDefaults: true
        }));
      }
      this.showSpinner();

      this.contextualizer = new Contextualizer();

      if (EnglishContextMessages) {
        this.contextualizer.addMessagesToContextualizedStrings(JSON.parse(EnglishContextMessages), "en");
      } else {
        self.debug("English Locales did not load.");
      }
      if (SpanishContextMessages) {
        this.contextualizer.addMessagesToContextualizedStrings(JSON.parse(SpanishContextMessages), "en");
      } else {
        this.debug("English Locales did not load.");
      }

      /*
       * Load the user
       */
      if (!this.loadTheAppForTheFirstTime) {
        self.debug("Loading encrypted user");
        self.status = "Loading encrypted user...";
        var u = localStorage.getItem("encryptedUser");
        self.get("authentication").loadEncryptedUser(u, function(success, errors) {

          self.status = "Turning on continuous sync with your team server...";
          self.replicateContinuouslyWithCouch(function() {
            /*
             * Load the backbone objects
             */
            self.debug("Creating backbone objects");
            self.status = "Building dashboard objects...";
            self.createAppBackboneObjects(self.get("couchConnection").pouchname, function() {

              /*
               * If you know the user, load their most recent
               * dashboard
               */
              self.debug("Loading the backbone objects");
              self.status = "Loading dashboard objects...";
              self.loadBackboneObjectsByIdAndSetAsCurrentDashboard(
                self.get("authentication").get(
                  "userPrivate").get("mostRecentIds"), function() {

                  self.debug("Starting the app");
                  self.startApp(function() {
                    window.app.showHelpOrNot();
                    self.stopSpinner();
                    window.app.router.renderDashboardOrNot(true);

                  });
                });
            });

          });

        });
      }

      window.onbeforeunload = this.warnUserAboutSavedSyncedStateBeforeUserLeaves;
    }
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      corpus: Corpus,
      authentication: Authentication,
      currentSession: Session,
      currentDataList: DataList,
      search: Search
    }
  },
  /*
   * This will be the only time the app should open the pouch.
   */
  changePouch: {
    value: function(couchConnection, callback) {
      if (!couchConnection || couchConnection === undefined) {
        self.debug("App.changePouch couchConnection must be supplied.");
        return;
      } else {
        self.debug("App.changePouch setting couchConnection: ", couchConnection);
        this.set("couchConnection", couchConnection);
      }
      //      alert("TODO set/validate that the the backone couchdb connection is the same as what user is asking for here");
      $.couch.urlPrefix = OPrime.getCouchUrl(window.app.get("couchConnection"), "");

      if (OPrime.isChromeApp()) {
        Backbone.couch_connector.config.base_url = this.getCouchUrl(couchConnection, "");
        Backbone.couch_connector.config.db_name = couchConnection.pouchname;
      } else {
        /* If the user is not in a chrome extension, the user MUST be on a url that corresponds with their corpus */
        try {
          var pieces = window.location.pathname.replace(/^\//, "").split("/");
          var pouchName = pieces[0];
          //Handle McGill server which runs out of a virtual directory
          if (pouchName === "corpus") {
            pouchName = pieces[1];
          }
          Backbone.couch_connector.config.db_name = pouchName;
        } catch (e) {
          OPrime.bug("Couldn't set the databse name off of the url, please report this.");
        }
      }

      if (typeof callback === "function") {
        callback();
      }
      return;



      // alert("TODO set/validate that the the pouch connection");
      // if (this.pouch === undefined) {
      //   // this.pouch = Backbone.sync.pouch("https://localhost:6984/"
      //   // + couchConnection.pouchname);
      //   this.pouch = Backbone.sync
      //     .pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + couchConnection.pouchname : OPrime.pouchUrl + couchConnection.pouchname);
      // }
      // if (typeof callback === "function") {
      //   callback();
      // }
    }
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
  createAppBackboneObjects: {
    value: function(optionalpouchname, callback) {
      if (optionalpouchname === null) {
        optionalpouchname = "default";
      }

      if (Backbone.couch_connector.config.db_name === "default") {
        OPrime.bug("The app doesn't know which database its in. This is a problem.");
      }

      if (this.get("authentication").get("userPublic") === undefined) {
        this.get("authentication").set("userPublic", new UserMask({
          pouchname: optionalpouchname
        }));
      }
      if (this.get("authentication").get("userPrivate") === undefined) {
        this.get("authentication").set("userPrivate", new User());
      }
      var c = new Corpus({
        pouchname: optionalpouchname
      });
      this.set("corpus", c);

      this.set("currentSession", new Session({
        pouchname: optionalpouchname,
      }));

      this.set("currentDataList", new DataList({
        pouchname: optionalpouchname
      }));

      this.set("search", new Search({
        pouchname: optionalpouchname
      }));


      if (typeof callback === "function") {
        callback();
      }
    }
  },

  startApp: {
    value: function(callback) {
      if (!window.appView) {
        window.appView = new AppView({
          model: this
        });
        /* Tell the app to render everything */
        window.appView.render();
      }

      if (typeof window.app.router === "function") {
        /* Tell the router to render the home screen divs */
        this.router = new AppRouter();
        this.router.renderDashboardOrNot(true);

        Backbone.history.start();
        if (typeof callback === "function") {
          self.debug("Calling back the startApps callback");
          callback();
        }
      }

    }
  },

  showSpinner: {
    value: function() {
      $('#dashboard_loading_spinner').html("<img class='spinner-image' src='images/loader.gif'/><p class='spinner-status'>Loading dashboard...</p>");
      $('.spinner-image').css({
        'width': function() {
          return ($(document).width() * 0.1) + 'px';
        },
        'height': function() {
          return ($(document).width() * 0.1) + 'px';
        },
        'padding-top': '10em'
      });
    }
  },
  stopSpinner: {
    value: function() {
      $('#dashboard_loading_spinner').html("");
    }
  },
  backUpUser: {
    value: function(callback) {
      var self = this;
      /* don't back up the public user, its not necessary the server doesn't modifications anyway. */
      if (self.get("authentication").get("userPrivate").get("username") === "public" || self.get("authentication").get("userPrivate").get("username") === "lingllama") {
        if (typeof callback === "function") {
          callback();
        }
      }
      this.saveAndInterConnectInApp(function() {
        //syncUserWithServer will prompt for password, then run the corpus replication.
        self.get("authentication").syncUserWithServer(function() {
          if (window.appView) {
            window.appView.toastUser("Backed up your user preferences with your authentication server, if you log into another device, your preferences will load.", "alert-info", "Backed-up:");
          }
          if (typeof callback === "function") {
            callback();
          }
        });
      });
    }
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
  logUserIntoTheirCorpusServer: {
    value: function(couchConnection, username,
      password, succescallback, failurecallback) {
      if (couchConnection === null || couchConnection === undefined) {
        couchConnection = this.get("couchConnection");
      }
      if (couchConnection === null || couchConnection === undefined) {
        alert("Bug: i couldnt log you into your couch database.");
      }

      /* if on android, turn on replication and don't get a session token */
      if (OPrime.isTouchDBApp()) {
        Android.setCredentialsAndReplicate(couchConnection.pouchname,
          username, password, couchConnection.domain);
        OPrime
          .debug("Not getting a session token from the users corpus server " +
            "since this is touchdb on android which has no idea of tokens.");
        if (typeof succescallback === "function") {
          succescallback();
        }
        return;
      }

      var couchurl = this.getCouchUrl(couchConnection, "/_session");
      var corpusloginparams = {};
      corpusloginparams.name = username;
      corpusloginparams.password = password;
      self.debug("Contacting your corpus server ", couchConnection, couchurl);

      var appself = this;
      $.couch.login({
        name: username,
        password: password,
        success: function(serverResults) {
          if (!serverResults) {
            OPrime.bug("There was a problem logging you into your backup database, please report this.");
          }
          if (window.appView) {
            window.appView
              .toastUser(
                "I logged you into your team server automatically, your syncs will be successful.",
                "alert-info", "Online Mode:");
          }


          /* if in chrome extension, or offline, turn on replication */
          if (OPrime.isChromeApp()) {
            //TODO turn on pouch and start replicating and then redirect user to their user page(?)
            //            appself.replicateContinuouslyWithCouch();
          }

          if (typeof succescallback === "function") {
            succescallback(serverResults);
          }
        },
        error: function(serverResults) {
          window
            .setTimeout(
              function() {
                //try one more time 5 seconds later
                $.couch.login({
                  name: username,
                  password: password,
                  success: function(serverResults) {
                    if (window.appView) {
                      window.appView
                        .toastUser(
                          "I logged you into your team server automatically, your syncs will be successful.",
                          "alert-info", "Online Mode:");
                    }
                    /* if in chrome extension, or offline, turn on replication */
                    if (OPrime.isChromeApp()) {
                      //TODO turn on pouch and start replicating and then redirect user to their user page(?)
                      //                      appself.replicateContinuouslyWithCouch();
                    }

                    if (typeof succescallback === "function") {
                      succescallback(serverResults);
                    }
                  },
                  error: function(serverResults) {
                    if (window.appView) {
                      window.appView
                        .toastUser(
                          "I couldn't log you into your corpus. What does this mean? " + "This means you can't upload data to train an auto-glosser or visualize your morphemes. " + "You also can't share your data with team members. If your computer is online and you are" + " using the Chrome Store app, then this probably the side effect of a bug that we might not know about... please report it to us :) " + OPrime.contactUs + " If you're offline you can ignore this warning, and sync later when you're online. ",
                          "alert-danger",
                          "Offline Mode:");
                    }
                    if (typeof failurecallback === "function") {
                      failurecallback("I couldn't log you into your corpus.");
                    }
                    self.debug(serverResults);
                    window.app.get("authentication").set(
                      "staleAuthentication", true);
                  }
                });
              }, 5000);
        }
      });
    }
  },
  getCouchUrl: {
    value: function(couchConnection, couchdbcommand) {
      if (!couchConnection) {
        couchConnection = this.get("couchConnection");
        self.debug("Using the apps ccouchConnection", couchConnection);
      } else {
        self.debug("Using the couchConnection passed in,", couchConnection, this.get("couchConnection"));
      }
      if (!couchConnection) {
        OPrime.bug("The couch url cannot be guessed. It must be provided by the App. Please report this bug.");
      }
      return OPrime.getCouchUrl(couchConnection, couchdbcommand);
    },
    /**
     * Synchronize to server and from database.
     */
    replicateContinuouslyWithCouch: function(successcallback,
      failurecallback) {
      var self = this;
      if (!self.pouch) {
        self.debug("Not replicating, no pouch ready.");
        if (typeof successcallback === "function") {
          successcallback();
        }
        return;
      }
      self.pouch(function(err, db) {
        var couchurl = this.getCouchUrl();
        if (err) {
          self.debug("Opening db error", err);
          if (typeof failurecallback === "function") {
            failurecallback();
          } else {
            alert('Opening DB error' + JSON.stringify(err));
            self.debug('Opening DB error' + JSON.stringify(err));
          }
        } else {
          self.debug("Opening db success", db);
          alert("TODO check to see if  needs a slash if replicating with pouch on " + couchurl);
          self.replicateFromCorpus(db, couchurl, function() {
            //turn on to regardless of fail or succeed
            self.replicateToCorpus(db, couchurl);
          }, function() {
            //turn on to regardless of fail or succeed
            self.replicateToCorpus(db, couchurl);
          });

          if (typeof successcallback === "function") {
            successcallback();
          }

        }
      });

    }
  },
  /**
   * Pull down corpus to offline pouch, if its there.
   */
  replicateOnlyFromCorpus: {
    value: function(couchConnection, successcallback, failurecallback) {
      var self = this;

      if (!self.pouch) {
        self.debug("Not replicating, no pouch ready.");
        if (typeof successcallback === "function") {
          successcallback();
        }
        return;
      }

      self.pouch(function(err, db) {
        var couchurl = self.getCouchUrl();
        if (err) {
          self.debug("Opening db error", err);
          if (typeof failurecallback === "function") {
            failurecallback();
          } else {
            alert('Opening DB error' + JSON.stringify(err));
            self.debug('Opening DB error' + JSON.stringify(err));
          }
        } else {
          db.replicate.from(couchurl, {
            continuous: false
          }, function(err, response) {
            self.debug("Replicate from " + couchurl, response, err);
            if (err) {
              if (typeof failurecallback === "function") {
                failurecallback();
              } else {
                alert('Corpus replicate from error' + JSON.stringify(err));
                self.debug('Corpus replicate from error' + JSON.stringify(err));
              }
            } else {
              self.debug("Corpus replicate from success", response);
              if (typeof successcallback === "function") {
                successcallback();
              }
            }
          });
        }
      });
    }
  },
  replicateToCorpus: {
    value: function(db, couchurl, success, failure) {
      db.replicate.to(couchurl, {
        continuous: true
      }, function(err, response) {
        self.debug("Replicated to " + couchurl);
        self.debug(response);
        self.debug(err);
        if (err) {
          self.debug("replicate to db  error", err);
          if (typeof failure === "function") {
            failure();
          } else {
            alert('Database replicate to error' + JSON.stringify(err));
            self.debug('Database replicate to error' + JSON.stringify(err));
          }
        } else {
          self.debug("Database replicate to success", response);
          if (typeof success === "function") {
            success();
          } else {
            self.debug('Database replicating' + JSON.stringify(couchConnection));
          }

        }
      });
    }
  },
  replicateFromCorpus: {
    value: function(db, couchurl, succes, fail) {
      db.replicate
        .from(couchurl, {
            continuous: true
          },
          function(err, response) {
            self.debug("Replicated from " + couchurl);
            self.debug(response);
            self.debug(err);
            if (err) {
              self.debug("replicate from db  error", err);
              if (typeof fail === "function") {
                fail();
              } else {
                alert('Database replicate from error' + JSON.stringify(err));
                self.debug('Database replicate from error' + JSON.stringify(err));
              }
            } else {
              self.debug("Database replicate from success",
                response);
              if (typeof succes === "function") {
                succes();
              } else {
                self.debug('Database replicating' + JSON.stringify(couchConnection));
              }

            }
          });
    }
  },

  loadBackboneObjectsByIdAndSetAsCurrentDashboard: {
    value: function(appids, callback) {
      self.debug("loadBackboneObjectsByIdAndSetAsCurrentDashboard");


      /*
       * Verify that the user is in their database, and that the
       * backbone couch adaptor is saving to the corpus' database,
       * not where the user currently is.
       */
      if (OPrime.isCouchApp()) {
        var corpusPouchName = appids.couchConnection.pouchname;
        if (window.location.href.indexOf(corpusPouchName) === -1) {
          if (corpusPouchName !== "public-firstcorpus") {
            var username = "";
            try {
              username = window.app.get("authentication").get("userPrivate").get("username") || "";
            } catch (e) {
              //do nothing
            }
            if (username !== "public") {
              OPrime.bug("You're not in the database for your most recent corpus. Please authenticate and then we will take you to your database...");
            }
          }
          var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin("public-firstcorpus");
          window.location.replace(optionalCouchAppPath + "user.html#login/" + corpusPouchName);

          //        window.app.get("authentication").syncUserWithServer(function(){
          //        window.location.replace(optionalCouchAppPath+"corpus.html");
          //        });
          return;
        }
      }

      if (Backbone.couch_connector.config.db_name === "default") {
        OPrime.bug("The app doesn't know which database its in. This is a problem.");
      }

      var couchConnection = appids.couchConnection;
      if (!couchConnection) {
        OPrime.bug("Could not figure out what was your most recent corpus, taking you to your user page where you can choose.");
        window.location.replace("user.html");
        return;
      }

      /* Upgrade chrome app user corpora's to v1.38+ */
      if (couchConnection.domain === "ifielddevs.iriscouch.com") {
        couchConnection.domain = "corpusdev.lingsync.org";
        couchConnection.port = "";
      }

      this.set("couchConnection", couchConnection);

      var corpusid = appids.corpusid;
      if (!corpusid) {
        corpusid = couchConnection.corpusid;
      }
      var c = new Corpus({
        "pouchname": couchConnection.pouchname,
        "couchConnection": couchConnection
      });
      var selfapp = this;
      if (!corpusid) {
        if (this.get("corpus").id) {
          corpusid = this.get("corpus").id;
        } else {
          self.status = "Opening/Creating Corpus...";
          this.get("corpus").loadOrCreateCorpusByPouchName(couchConnection.pouchname, function() {
            /* if the corpusid is missing, make sure there are other objects in the dashboard */
            selfapp.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids, callback);
            //          window.app.stopSpinner();
          });
          return;
        }
      }
      c.id = corpusid; //tried setting both ids to match, and it worked!!
      c.fetch({
        success: function(corpusModel) {
          var tags;

          //            alert("Corpus fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
          self.debug("Corpus fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard", corpusModel);

          /* Upgrade chrome app user corpora's to v1.38+ */
          var oldCouchConnection = corpusModel.get("couchConnection");
          if (oldCouchConnection) {
            if (oldCouchConnection.domain === "ifielddevs.iriscouch.com") {
              oldCouchConnection.domain = "corpusdev.lingsync.org";
              oldCouchConnection.port = "";
              corpusModel.set("couchConnection", oldCouchConnection);
            }
          }

          try {
            tags = corpusModel.get("datumFields").where({
              label: "tags"
            });
            if (tags.length === 0) {
              /* If its missing tags, add upgrade the corpus to version v1.38+ */
              corpusModel.get("datumFields").add(new DatumField({
                label: "tags",
                shouldBeEncrypted: "",
                userchooseable: "disabled",
                help: "Tags for constructions or other info that you might want to use to categorize your data."
              }));
              corpusModel.get("datumFields").add(new DatumField({
                label: "validationStatus",
                shouldBeEncrypted: "",
                userchooseable: "disabled",
                help: "For example: To be checked with a language consultant, Checked with Sebrina, Deleted etc..."
              }));
            }
          } catch (e) {
            OPrime.debug("Unable to add the tags and or validationStatus field to the corpus.");
          }
          try {
            tags = corpusModel.get("datumFields").where({
              label: "syntacticTreeLatex"
            });
            if (tags.length === 0) {
              /* If its missing syntacticTreeLatex, add upgrade the corpus to version v1.54+ */
              corpusModel.get("datumFields").add(new DatumField({
                label: "syntacticTreeLatex",
                showToUserTypes: "machine",
                shouldBeEncrypted: "",
                userchooseable: "disabled",
                help: "This optional field is used by the machine to make LaTeX trees and help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of LaTeX Tree package (we use QTree by default) Sample entry: \\Tree [.S NP VP ]"
              }));

            }
          } catch (e) {
            OPrime.debug("Unable to add the syntacticTreeLatex field to the corpus.");
          }

          self.status = "Opened Corpus...";

          c.setAsCurrentCorpus(function() {
            self.status = "Loading Corpus...";

            /*
             * Fetch sessions and datalists
             */
            c.datalists.fetchDatalists();
            c.sessions.fetchSessions();
            c.fetchPublicSelf();

            var dl = new DataList({
              "pouchname": couchConnection.pouchname
            });
            dl.id = appids.datalistid;
            dl.fetch({
              success: function(dataListModel) {
                self.status = "Opened DataList...";

                //                    alert("Data list fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
                self.debug("Data list fetched successfully", dataListModel);
                dl.setAsCurrentDataList(function() {
                  self.status = "Loading your most recent DataList, " + dataListModel.get("datumIds").length + " entries...";

                  var s = new Session({
                    "pouchname": couchConnection.pouchname
                  });
                  s.id = appids.sessionid;
                  s.fetch({
                    success: function(sessionModel) {
                      self.status = "Opened Elicitation Session...";

                      //                            alert("Session fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
                      self.debug("Session fetched successfully", sessionModel);
                      s.setAsCurrentSession(function() {

                        self.status = "Loading Elicitation Session...";

                        //                              alert("Entire dashboard fetched and loaded and linked up with views correctly.");
                        self.debug("Entire dashboard fetched and loaded and linked up with views correctly.");
                        if (window.appView) {
                          window.appView.toastUser("Your dashboard has been loaded from where you left off last time.", "alert-success", "Dashboard loaded!");
                        }
                        /*
                         * After all fetches have succeeded show the pretty dashboard, the objects have already been linked up by their setAsCurrent methods
                         */
                        self.status = "Rendering Dashboard...";

                        window.app.stopSpinner();


                        if (typeof callback === "function") {
                          callback();
                        }
                      }, function() {
                        alert("Failure to set as current session in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
                      });
                    },
                    error: function(model, error, options) {
                      alert("There was an error fetching the session. " + error.reason);
                      s.set(
                        "sessionFields", window.app.get("corpus").get("sessionFields").clone()
                      );
                    }
                  }); //end session fetch

                }, function() {
                  alert("Failure to set as current data list in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
                });
              },
              error: function(model, error, options) {
                alert("There was an error fetching the data list. " + error.reason);
              }
            }); //end fetch data list

          }, function() {
            alert("Failure to set as current corpus in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
          }); //end setAsCurrentCorpus
        },
        error: function(model, error, options) {
          self.debug("There was an error fetching corpus ", model, error, options);

          var reason = "";
          if (error.reason) {
            reason = error.reason.message || error.reason || "";
          }
          if (reason.indexOf("not authorized") >= 0 || reason.indexOf("nthorized") >= 0) {
            //Show quick authentication so the user can get their corpus token and get access to the data
            var originalCallbackFromLoadBackboneApp = callback;
            window.app.get("authentication").syncUserWithServer(function() {
              self.debug("Trying to reload the app after a session token has timed out");
              self.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids, originalCallbackFromLoadBackboneApp);
            }, couchConnection.pouchname);
            //            var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin("public-firstcorpus");
            //            window.location.replace(optionalCouchAppPath+"corpus.html#login");
          } else {
            if (reason.indexOf("nexpected end of input") >= 0) {
              OPrime.bug("You appear to be offline. Version 1-40 work offline, versions 41-46 are online only. We are waiting for an upgrade in the PouchDB library (this is what makes it possible to have an offline database).");
            } else {
              OPrime.bug("You appear to be offline. If you are not offline, please report this.");
            }
          }
        }
      }); //end corpus fetch
    }
  },

  router: {
    value: AppRouter
  },

  showHelpOrNot: {
    value: function() {

      var username = this.get("authentication").get("userPrivate").get("username");
      if (username === "public") {
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
      if (helpShownTimestamp === 0) {
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
      if (milisecondsSinceLastHelp > 432000000 && helpShownTimestamp !== 0) {
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
  warnUserAboutSavedSyncedStateBeforeUserLeaves: {
    value: function(e) {
      var returntext = "";
      if (window.appView) {
        if (window.appView.totalUnsaved.length >= 1) {
          returntext = "You have unsaved changes, click cancel to save them. \n\n";
        }
        if (window.appView.totalUnsaved.length >= 1) {
          returntext = returntext + "You have unsynced changes, click cancel and then click the sync button to sync them. This is only important if you want to back up your data or if you are sharing your data with a team. \n\n";
        }
      }
      if (returntext === "") {
        return; //don't show a pop up
      } else {
        return "Either you haven't been using the app and Chrome wants some of its memory back, or you want to leave the app.\n\n" + returntext;
      }
    }
  },
  /**
   * Saves a json file via REST to a couchdb, must be online.
   *
   * @param bareActivityObject
   */
  addActivity: {
    value: function(bareActivityObject) {
      bareActivityObject.verb = bareActivityObject.verb.replace("href=", "target='_blank' href=");
      bareActivityObject.directobject = bareActivityObject.directobject.replace("href=", "target='_blank' href=");
      bareActivityObject.indirectobject = bareActivityObject.indirectobject.replace("href=", "target='_blank' href=");
      bareActivityObject.context = bareActivityObject.context.replace("href=", "target='_blank' href=");

      self.debug("Saving activity: ", bareActivityObject);
      var backboneActivity = new Activity(bareActivityObject);

      var couchConnection = this.get("couchConnection");
      var activitydb = couchConnection.pouchname + "-activity_feed";
      if (bareActivityObject.teamOrPersonal !== "team") {
        activitydb = this.get("authentication").get("userPrivate").get("username") + "-activity_feed";
        backboneActivity.attributes.user.set("gravatar", this.get("authentication").get("userPrivate").get("gravatar"));
      }
      var couchurl = OPrime.getCouchUrl(couchConnection, "/" + activitydb);

      OPrime.makeCORSRequest({
        type: 'POST',
        url: couchurl,
        data: backboneActivity.toJSON(),
        success: function(resp) {
          self.debug("Successfully saved activity to your activity couch.", resp);
        },
        error: function(e, f, g) {
          self.debug("Error saving activity", e, f, g);
          localStorage.setItem("activity" + Date.now(), backboneActivity.toJSON());
        }
      });


      //      if (bareActivityObject.get("teamOrPersonal") === "team") {
      //        window.app.get("currentCorpusTeamActivityFeed").addActivity(bareActivityObject);
      //      } else {
      //        window.app.get("currentUserActivityFeed").addActivity(bareActivityObject);
      //      }
    }
  },

  /**
   * This function sequentially saves first the session, datalist and then corpus. Its success callback is called if all saves succeed, its fail is called if any fail.
   * @param successcallback
   * @param failurecallback
   */
  saveAndInterConnectInApp: {
    value: function(successcallback, failurecallback) {
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
              if (typeof successcallback === "function") {
                successcallback();
              }

            }, failurecallback);
          }, failurecallback);
        }, failurecallback);
      }, failurecallback);
    }
  },

  subscribers: {
    value: {
      any: []
    }
  },

  subscribe: {
    value: function(type, fn, context) {
      type = type || 'any';
      fn = typeof fn === "function" ? fn : context[fn];

      if (typeof this.subscribers[type] === "undefined") {
        this.subscribers[type] = [];
      }
      this.subscribers[type].push({
        fn: fn,
        context: context || this
      });
    }
  },

  unsubscribe: {
    value: function(type, fn, context) {
      this.visitSubscribers('unsubscribe', type, fn, context);
    }
  },

  publish: {
    value: function(type, publication) {
      this.visitSubscribers('publish', type, publication);
    }
  },

  visitSubscribers: {
    value: function(action, type, arg, context) {
      var pubtype = type || 'any';
      var subscribers = this.subscribers[pubtype];
      if (!subscribers || subscribers.length === 0) {
        self.debug(pubtype + ": There were no subscribers.");
        return;
      }
      var i;
      var maxUnsubscribe = subscribers ? subscribers.length - 1 : 0;
      var maxPublish = subscribers ? subscribers.length : 0;

      if (action === 'publish') {
        // count up so that older subscribers get the message first
        for (i = 0; i < maxPublish; i++) {
          if (subscribers[i]) {
            // TODO there is a bug with the subscribers they are getting lost, and
            // it is trying to call fn of undefiend. this is a workaround until we
            // figure out why subscribers are getting lost. Update: i changed the
            // loop to count down and remove subscribers from the ends, now the
            // size of subscribers isnt changing such that the subscriber at index
            // i doesnt exist.
            subscribers[i].fn.call(subscribers[i].context, arg);
          }
        }
        self.debug('Visited ' + subscribers.length + ' subscribers.');

      } else {

        // count down so that subscribers index exists when we remove them
        for (i = maxUnsubscribe; i >= 0; i--) {
          try {
            if (!subscribers[i].context) {
              OPrime
                .debug("This subscriber has no context. should we remove it? " + i);
            }
            if (subscribers[i].context === context) {
              var removed = subscribers.splice(i, 1);
              self.debug("Removed subscriber " + i + " from " + type, removed);
            } else {
              self.debug(type + " keeping subscriber " + i,
                subscribers[i].context);
            }
          } catch (e) {
            self.debug("problem visiting Subscriber " + i, subscribers);
          }
        }
      }
    }
  }

});
exports.App = App;
