/* globals window, localStorage, Android, navigator */
var FieldDBObject = require('./../FieldDBObject').FieldDBObject;
var Activity = require('./../activity/Activity').Activity;
var Authentication = require('./../FieldDBObject').FieldDBObject;
var Corpus = require('./../corpus/Corpus').Corpus;
var DataList = require('./../data_list/DataList').DataList;
var DatumField = require('./../datum/DatumField').DatumField;
var Search = require('./../search/Search').Search;
var Session = require('./../FieldDBObject').FieldDBObject;
var Router = require('./../Router').Router;
var User = require('./../user/User').User;
var UserMask = require('./../user/UserMask').UserMask;
var Contextualizer = require('./../locales/Contextualizer').Contextualizer;
var EnglishContextMessages = require('./../locales/en/messages.json');
var SpanishContextMessages = require('./../locales/es/messages.json');

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

  authentication: {
    get: function() {
      return this._authentication || FieldDBObject.DEFAULT_OBJECT;
    },
    set: function(value) {
      if (value === this._authentication) {
        return;
      }
      if (!value) {
        delete this._authentication;
        return;
      } else {
        if (value && this.INTERNAL_MODELS && this.INTERNAL_MODELS['authentication'] && typeof this.INTERNAL_MODELS['authentication'] === "function" && value.constructor !== this.INTERNAL_MODELS['authentication']) {
          this.debug("Parsing model: " + value);
          value = new this.INTERNAL_MODELS['authentication'](value);
        }
      }
      this._confidential = value;
    }
  },

  contextualizer: {
    get: function() {
      return this._contextualizer || FieldDBObject.DEFAULT_OBJECT;
    },
    set: function(value) {
      if (value === this._contextualizer) {
        return;
      }
      if (!value) {
        delete this._contextualizer;
        return;
      } else {
        if (value && this.INTERNAL_MODELS && this.INTERNAL_MODELS['contextualizer'] && typeof this.INTERNAL_MODELS['contextualizer'] === "function" && value.constructor !== this.INTERNAL_MODELS['contextualizer']) {
          this.debug("Parsing model: ", value);
          value = new this.INTERNAL_MODELS['contextualizer'](value);
          if (EnglishContextMessages) {
            value.addMessagesToContextualizedStrings(EnglishContextMessages, "en");
          } else {
            this.debug("English Locales did not load.");
          }
          if (SpanishContextMessages) {
            value.addMessagesToContextualizedStrings(SpanishContextMessages, "es");
          } else {
            this.debug("English Locales did not load.");
          }
        }
      }
      this._contextualizer = value;
    }
  },

  contextualize: {
    value: function(value) {
      if (this._contextualizer) {
        return this._contextualizer.contextualize(value);
      } else {
        return value;
      }
    }
  },

  load: {
    value: this.fetch
  },

  fetch: {
    value: function() {
      var self = this;

      /*
       * Load the user
       */
      if (!this.loadTheAppForTheFirstTime) {
        self.debug("Loading encrypted user");
        self.status = "Loading encrypted user...";
        var u = localStorage.getItem("encryptedUser");
        self.authentication.loadEncryptedUser(u, function(success, errors) {
          self.debug("loadEncryptedUser", success, errors);

          self.status = "Turning on continuous sync with your team server...";
          self.replicateContinuouslyWithCouch(function() {
            /*
             * Load the backbone objects
             */
            self.debug("Creating backbone objects");
            self.status = "Building dashboard objects...";
            self.createAppFieldDBObjects(self.couchConnection.pouchname, function() {

              /*
               * If you know the user, load their most recent
               * dashboard
               */
              self.debug("Loading the backbone objects");
              self.status = "Loading dashboard objects...";
              self.loadFieldDBObjectsByIdAndSetAsCurrentDashboard(
                self.authentication.userPrivate.mostRecentIds, function() {

                  self.debug("Starting the app");
                  self.startApp(function() {
                    self.showHelpOrNot();
                    self.stopSpinner();
                    self.router.renderDashboardOrNot(true);

                  });
                });
            });

          });

        });
      }

      try {
        window.onbeforeunload = this.warnUserAboutSavedSyncedStateBeforeUserLeaves;
      } catch (e) {
        this.warn("Cannot prevent the user from exiting if there are unsaved changes.");
      }
    }
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      corpus: Corpus,
      contextualizer: Contextualizer,
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
        this.debug("App.changePouch couchConnection must be supplied.");
        return;
      } else {
        this.debug("App.changePouch setting couchConnection: ", couchConnection);
        this.set("couchConnection", couchConnection);
      }
      //      self.bug("TODO set/validate that the the backone couchdb connection is the same as what user is asking for here");
      FieldDBObject.couch.urlPrefix = this.getCouchUrl(this.couchConnection, "");

      if (this.isChromeApp) {
        FieldDBObject.couch_connector.config.base_url = this.getCouchUrl(couchConnection, "");
        FieldDBObject.couch_connector.config.db_name = couchConnection.pouchname;
      } else {
        /* If the user is not in a chrome extension, the user MUST be on a url that corresponds with their corpus */
        try {
          var pieces = window.location.pathname.replace(/^\//, "").split("/");
          var pouchName = pieces[0];
          //Handle McGill server which runs out of a virtual directory
          if (pouchName === "corpus") {
            pouchName = pieces[1];
          }
          FieldDBObject.couch_connector.config.db_name = pouchName;
        } catch (e) {
          this.bug("Couldn't set the databse name off of the url, please report this.");
        }
      }

      if (typeof callback === "function") {
        callback();
      }
      return;



      // self.bug("TODO set/validate that the the pouch connection");
      // if (this.pouch === undefined) {
      //   // this.pouch = FieldDBObject.sync.pouch("https://localhost:6984/"
      //   // + couchConnection.pouchname);
      //   this.pouch = FieldDBObject.sync
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
   * has first loaded, use the loadFieldDBObjectsById function below.
   *
   * @param callback
   */
  createAppFieldDBObjects: {
    value: function(optionalpouchname, callback) {
      if (optionalpouchname === null) {
        optionalpouchname = "default";
      }

      if (FieldDBObject.couch_connector.config.db_name === "default") {
        this.bug("The app doesn't know which database its in. This is a problem.");
      }

      if (this.authentication.userPublic === undefined) {
        this.authentication.set("userPublic", new UserMask({
          pouchname: optionalpouchname
        }));
      }
      if (this.authentication.userPrivate === undefined) {
        this.authentication.set("userPrivate", new User());
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
      /* Tell the app to render everything */
      this.render();

      if (typeof this.router === "function") {
        /* Tell the router to render the home screen divs */
        this.router = new Router();
        this.router.renderDashboardOrNot(true);

        FieldDBObject.history.start();
        if (typeof callback === "function") {
          this.debug("Calling back the startApps callback");
          callback();
        }
      }

    }
  },

  loading: {
    get: function() {
      return this._loading || this.fetching || false;
    },
    set: function(value) {
      if (value === this._loading) {
        return;
      }
      value = !!value;
      if (value === true) {
        this.status = "Loading dashboard";
      }
      this.loading = value;
    }
  },

  stopSpinner: {
    value: function() {
      this.loading = false;
    }
  },
  backUpUser: {
    value: function(callback) {
      var self = this;
      /* don't back up the public user, its not necessary the server doesn't modifications anyway. */
      if (self.authentication.userPrivate.username === "public" || self.authentication.userPrivate.username === "lingllama") {
        if (typeof callback === "function") {
          callback();
        }
      }
      this.saveAndInterConnectInApp(function() {
        //syncUserWithServer will prompt for password, then run the corpus replication.
        self.authentication.syncUserWithServer(function() {
          if (self.view) {
            self.toastUser("Backed up your user preferences with your authentication server, if you log into another device, your preferences will load.", "alert-info", "Backed-up:");
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
    value: function(couchConnection, username, password, succescallback, failurecallback) {
      var self = this;

      if (couchConnection === null || couchConnection === undefined) {
        couchConnection = this.couchConnection;
      }
      if (couchConnection === null || couchConnection === undefined) {
        this.bug("Bug: i couldnt log you into your couch database.");
      }

      /* if on android, turn on replication and don't get a session token */
      if (this.isTouchDBApp()) {
        Android.setCredentialsAndReplicate(couchConnection.pouchname,
          username, password, couchConnection.domain);
        this.debug("Not getting a session token from the users corpus server " + "since this is touchdb on android which has no idea of tokens.");
        if (typeof succescallback === "function") {
          succescallback();
        }
        return;
      }

      var couchurl = this.getCouchUrl(couchConnection, "/_session");
      var corpusloginparams = {};
      corpusloginparams.name = username;
      corpusloginparams.password = password;
      this.debug("Contacting your corpus server ", couchConnection, couchurl);

      this.couch.login({
        name: username,
        password: password,
        success: function(serverResults) {
          if (!serverResults) {
            self.bug("There was a problem logging you into your backup database, please report this.");
          }
          if (self.view) {
            self.toastUser(
              "I logged you into your team server automatically, your syncs will be successful.",
              "alert-info", "Online Mode:");
          }


          /* if in chrome extension, or offline, turn on replication */
          if (self.isChromeApp) {
            //TODO turn on pouch and start replicating and then redirect user to their user page(?)
            //            appself.replicateContinuouslyWithCouch();
          }

          if (typeof succescallback === "function") {
            succescallback(serverResults);
          }
        },
        error: function(serverResults) {
          self.debug("serverResults", serverResults);
          self.timeout(
            function() {
              //try one more time 5 seconds later
              FieldDBObject.couch.login({
                name: username,
                password: password,
                success: function(serverResults) {
                  if (self.view) {
                    self.toastUser(
                      "I logged you into your team server automatically, your syncs will be successful.",
                      "alert-info", "Online Mode:");
                  }
                  /* if in chrome extension, or offline, turn on replication */
                  if (self.isChromeApp) {
                    //TODO turn on pouch and start replicating and then redirect user to their user page(?)
                    //                      appself.replicateContinuouslyWithCouch();
                  }

                  if (typeof succescallback === "function") {
                    succescallback(serverResults);
                  }
                },
                error: function(serverResults) {
                  if (self.view) {
                    self.toastUser(
                      "I couldn't log you into your corpus. What does this mean? " + "This means you can't upload data to train an auto-glosser or visualize your morphemes. " + "You also can't share your data with team members. If your computer is online and you are" + " using the Chrome Store app, then this probably the side effect of a bug that we might not know about... please report it to us :) " + self.contextualizer.contactUs + " If you're offline you can ignore this warning, and sync later when you're online. ",
                      "alert-danger",
                      "Offline Mode:");
                  }
                  if (typeof failurecallback === "function") {
                    failurecallback("I couldn't log you into your corpus.");
                  }
                  self.debug(serverResults);
                  self.authentication.set(
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
        couchConnection = this.couchConnection;
        this.debug("Using the apps ccouchConnection", couchConnection);
      } else {
        this.debug("Using the couchConnection passed in,", couchConnection, this.couchConnection);
      }
      if (!couchConnection) {
        this.bug("The couch url cannot be guessed. It must be provided by the App. Please report this bug.");
      }
      return this.getCouchUrl(couchConnection, couchdbcommand);
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
        var couchurl = self.getCouchUrl();
        if (err) {
          self.debug("Opening db error", err);
          if (typeof failurecallback === "function") {
            failurecallback();
          } else {
            this.bug('Opening DB error' + JSON.stringify(err));
            self.debug('Opening DB error' + JSON.stringify(err));
          }
        } else {
          self.debug("Opening db success", db);
          self.bug("TODO check to see if  needs a slash if replicating with pouch on " + couchurl);
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
            self.bug('Opening DB error' + JSON.stringify(err));
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
                self.bug('Corpus replicate from error' + JSON.stringify(err));
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
      var self = this;

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
            self.bug('Database replicate to error' + JSON.stringify(err));
            self.debug('Database replicate to error' + JSON.stringify(err));
          }
        } else {
          self.debug("Database replicate to success", response);
          if (typeof success === "function") {
            success();
          } else {
            self.debug('Database replicating' + JSON.stringify(self.couchConnection));
          }

        }
      });
    }
  },
  replicateFromCorpus: {
    value: function(db, couchurl, succes, fail) {
      var self = this;

      db.replicate.from(couchurl, {
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
              self.bug('Database replicate from error' + JSON.stringify(err));
              self.debug('Database replicate from error' + JSON.stringify(err));
            }
          } else {
            self.debug("Database replicate from success",
              response);
            if (typeof succes === "function") {
              succes();
            } else {
              self.debug('Database replicating' + JSON.stringify(self.couchConnection));
            }

          }
        });
    }
  },

  loadFieldDBObjectsByIdAndSetAsCurrentDashboard: {
    value: function(appids, callback) {
      var self = this;

      this.debug("loadFieldDBObjectsByIdAndSetAsCurrentDashboard");


      /*
       * Verify that the user is in their database, and that the
       * backbone couch adaptor is saving to the corpus' database,
       * not where the user currently is.
       */
      if (this.isCouchApp()) {
        var corpusPouchName = appids.couchConnection.pouchname;
        if (window.location.href.indexOf(corpusPouchName) === -1) {
          if (corpusPouchName !== "public-firstcorpus") {
            var username = "";
            try {
              username = this.authentication.userPrivate.username || "";
            } catch (e) {
              //do nothing
            }
            if (username !== "public") {
              this.bug("You're not in the database for your most recent corpus. Please authenticate and then we will take you to your database...");
            }
          }
          var optionalCouchAppPath = this.guessCorpusUrlBasedOnWindowOrigin("public-firstcorpus");
          this.router.navigate(optionalCouchAppPath + "user.html#login/" + corpusPouchName);

          //        self.authentication.syncUserWithServer(function(){
          //        window.location.replace(optionalCouchAppPath+"corpus.html");
          //        });
          return;
        }
      }

      if (FieldDBObject.couch_connector.config.db_name === "default") {
        this.bug("The app doesn't know which database its in. This is a problem.");
      }

      var couchConnection = appids.couchConnection;
      if (!couchConnection) {
        this.bug("Could not figure out what was your most recent corpus, taking you to your user page where you can choose.");
        this.router.navigate("user.html");
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
      if (!corpusid) {
        if (this.corpus.id) {
          corpusid = this.corpus.id;
        } else {
          this.status = "Opening/Creating Corpus...";
          this.corpus.loadOrCreateCorpusByPouchName(couchConnection.pouchname, function() {
            /* if the corpusid is missing, make sure there are other objects in the dashboard */
            self.loadFieldDBObjectsByIdAndSetAsCurrentDashboard(appids, callback);
            //          self.stopSpinner();
          });
          return;
        }
      }
      c.id = corpusid; //tried setting both ids to match, and it worked!!
      c.fetch({
        success: function(corpusModel) {
          var tags;

          //            self.bug("Corpus fetched successfully in loadFieldDBObjectsByIdAndSetAsCurrentDashboard");
          self.debug("Corpus fetched successfully in loadFieldDBObjectsByIdAndSetAsCurrentDashboard", corpusModel);

          /* Upgrade chrome app user corpora's to v1.38+ */
          var oldCouchConnection = corpusModel.couchConnection;
          if (oldCouchConnection) {
            if (oldCouchConnection.domain === "ifielddevs.iriscouch.com") {
              oldCouchConnection.domain = "corpusdev.lingsync.org";
              oldCouchConnection.port = "";
              corpusModel.set("couchConnection", oldCouchConnection);
            }
          }

          try {
            tags = corpusModel.datumFields.where({
              label: "tags"
            });
            if (tags.length === 0) {
              /* If its missing tags, add upgrade the corpus to version v1.38+ */
              corpusModel.datumFields.add(new DatumField({
                label: "tags",
                shouldBeEncrypted: "",
                userchooseable: "disabled",
                help: "Tags for constructions or other info that you might want to use to categorize your data."
              }));
              corpusModel.datumFields.add(new DatumField({
                label: "validationStatus",
                shouldBeEncrypted: "",
                userchooseable: "disabled",
                help: "For example: To be checked with a language consultant, Checked with Sebrina, Deleted etc..."
              }));
            }
          } catch (e) {
            self.debug("Unable to add the tags and or validationStatus field to the corpus.");
          }
          try {
            tags = corpusModel.datumFields.where({
              label: "syntacticTreeLatex"
            });
            if (tags.length === 0) {
              /* If its missing syntacticTreeLatex, add upgrade the corpus to version v1.54+ */
              corpusModel.datumFields.add(new DatumField({
                label: "syntacticTreeLatex",
                showToUserTypes: "machine",
                shouldBeEncrypted: "",
                userchooseable: "disabled",
                help: "This optional field is used by the machine to make LaTeX trees and help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of LaTeX Tree package (we use QTree by default) Sample entry: \\Tree [.S NP VP ]"
              }));

            }
          } catch (e) {
            self.debug("Unable to add the syntacticTreeLatex field to the corpus.");
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

                //                    self.bug("Data list fetched successfully in loadFieldDBObjectsByIdAndSetAsCurrentDashboard");
                self.debug("Data list fetched successfully", dataListModel);
                dl.setAsCurrentDataList(function() {
                  self.status = "Loading your most recent DataList, " + dataListModel.datumIds.length + " entries...";

                  var s = new Session({
                    "pouchname": couchConnection.pouchname
                  });
                  s.id = appids.sessionid;
                  s.fetch({
                    success: function(sessionModel) {
                      self.status = "Opened Elicitation Session...";

                      //                            self.bug("Session fetched successfully in loadFieldDBObjectsByIdAndSetAsCurrentDashboard");
                      self.debug("Session fetched successfully", sessionModel);
                      s.setAsCurrentSession(function() {

                        self.status = "Loading Elicitation Session...";

                        //                              self.bug("Entire dashboard fetched and loaded and linked up with views correctly.");
                        self.debug("Entire dashboard fetched and loaded and linked up with views correctly.");
                        if (self.view) {
                          self.toastUser("Your dashboard has been loaded from where you left off last time.", "alert-success", "Dashboard loaded!");
                        }
                        /*
                         * After all fetches have succeeded show the pretty dashboard, the objects have already been linked up by their setAsCurrent methods
                         */
                        self.status = "Rendering Dashboard...";

                        self.stopSpinner();


                        if (typeof callback === "function") {
                          callback();
                        }
                      }, function() {
                        self.bug("Failure to set as current session in loadFieldDBObjectsByIdAndSetAsCurrentDashboard");
                      });
                    },
                    error: function(model, error, options) {
                      self.bug("There was an error fetching the session. " + error.reason);
                      self.debug("options", options);
                      s.set(
                        "sessionFields", self.corpus.sessionFields.clone()
                      );
                    }
                  }); //end session fetch

                }, function() {
                  self.bug("Failure to set as current data list in loadFieldDBObjectsByIdAndSetAsCurrentDashboard");
                });
              },
              error: function(model, error, options) {
                self.debug("options", options);

                self.bug("There was an error fetching the data list. " + error.reason);
              }
            }); //end fetch data list

          }, function() {
            self.bug("Failure to set as current corpus in loadFieldDBObjectsByIdAndSetAsCurrentDashboard");
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
            var originalCallbackFromLoadFieldDBObjectApp = callback;
            self.authentication.syncUserWithServer(function() {
              self.debug("Trying to reload the app after a session token has timed out");
              self.loadFieldDBObjectsByIdAndSetAsCurrentDashboard(appids, originalCallbackFromLoadFieldDBObjectApp);
            }, couchConnection.pouchname);
            //            var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin("public-firstcorpus");
            //            window.location.replace(optionalCouchAppPath+"corpus.html#login");
          } else {
            if (reason.indexOf("nexpected end of input") >= 0) {
              self.bug("You appear to be offline. Version 1-40 work offline, versions 41-46 are online only. We are waiting for an upgrade in the PouchDB library (this is what makes it possible to have an offline database).");
            } else {
              self.bug("You appear to be offline. If you are not offline, please report this.");
            }
          }
        }
      }); //end corpus fetch
    }
  },

  router: {
    value: Router
  },

  showHelpOrNot: {
    value: function() {
      var self = this;

      var username = this.authentication.userPrivate.username;
      if (username === "public") {
        //Dont show the help screen for the public user
        return;
      }
      var helpShownCount = localStorage.getItem(username + "helpShownCount") || 0;
      var helpShownTimestamp = localStorage.getItem(username + "helpShownTimestamp") || 0;

      /*
       * dont show the guide immediately if they are truely a new
       * user, let them see the dashboard before they wonder how
       * to use it. 60 seconds later, show the help.
       */
      if (helpShownTimestamp === 0) {
        self.helpCountReason = "Just in case you were wondering what all those buttons are for, check out Gretchen's Illustrated Guide to your dashboard! ";

        self.helpCount = 3 - helpShownCount;
        localStorage.setItem(username + "helpShownCount", ++helpShownCount);
        localStorage.setItem(username + "helpShownTimestamp", Date.now());
        self.timeout(function() {
          self.router.navigate("help/illustratedguide", {
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
        self.helpCountReason = "Welcome back! It's been more than 5 days since you opened the app. ";
      }
      if (helpShownCount > 3) {
        // do nothing
      } else {
        self.helpCount = 3 - helpShownCount;
        localStorage.setItem(username + "helpShownCount", ++helpShownCount);
        localStorage.setItem(username + "helpShownTimestamp", Date.now());
        self.router.navigate("help/illustratedguide", {
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
      this.debug("warnUserAboutSavedSyncedStateBeforeUserLeaves", e);
      var returntext = "";
      if (this.view) {
        if (this.view.totalUnsaved.length >= 1) {
          returntext = "You have unsaved changes, click cancel to save them. \n\n";
        }
        if (this.view.totalUnsaved.length >= 1) {
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
      var self = this;

      bareActivityObject.verb = bareActivityObject.verb.replace("href=", "target='_blank' href=");
      bareActivityObject.directobject = bareActivityObject.directobject.replace("href=", "target='_blank' href=");
      bareActivityObject.indirectobject = bareActivityObject.indirectobject.replace("href=", "target='_blank' href=");
      bareActivityObject.context = bareActivityObject.context.replace("href=", "target='_blank' href=");

      self.debug("Saving activity: ", bareActivityObject);
      var backboneActivity = new Activity(bareActivityObject);

      var couchConnection = this.couchConnection;
      var activitydb = couchConnection.pouchname + "-activity_feed";
      if (bareActivityObject.teamOrPersonal !== "team") {
        activitydb = this.authentication.userPrivate.username + "-activity_feed";
        backboneActivity.attributes.user.set("gravatar", this.authentication.userPrivate.gravatar);
      }

      if (bareActivityObject.teamOrPersonal === "team") {
        self.currentCorpusTeamActivityFeed.addActivity(bareActivityObject);
      } else {
        self.currentUserActivityFeed.addActivity(bareActivityObject);
      }
    }
  },

  /**
   * This function sequentially saves first the session, datalist and then corpus. Its success callback is called if all saves succeed, its fail is called if any fail.
   * @param successcallback
   * @param failurecallback
   */
  saveAndInterConnectInApp: {
    value: function(successcallback, failurecallback) {
      var self = this;
      if (!failurecallback) {
        failurecallback = function() {
          self.bug("There was a bug/problem in the saveAndInterConnectInApp in App.js, somewhere along the save call. The Session is saved first, if it succeeds, then the datalist, then the corpus. The failure is somewhere along there.");
        };
      }
      self.currentSession.saveAndInterConnectInApp(function() {
        self.currentDataList.saveAndInterConnectInApp(function() {
          self.corpus.saveAndInterConnectInApp(function() {
            self.authentication.saveAndInterConnectInApp(function() {

              self.authentication.staleAuthentication = true;
              //              localStorage.setItem("mostRecentDashboard", JSON.stringify(self.authentication.userPrivate.mostRecentIds));
              if (self.view) {
                self.toastUser("Your dashboard has been saved, you can exit the app at anytime and return to this state.", "alert-success", "Exit at anytime:");
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
        this.debug(pubtype + ": There were no subscribers.");
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
        this.debug('Visited ' + subscribers.length + ' subscribers.');

      } else {

        // count down so that subscribers index exists when we remove them
        for (i = maxUnsubscribe; i >= 0; i--) {
          try {
            if (!subscribers[i].context) {
              this.debug("This subscriber has no context. should we remove it? " + i);
            }
            if (subscribers[i].context === context) {
              var removed = subscribers.splice(i, 1);
              this.debug("Removed subscriber " + i + " from " + type, removed);
            } else {
              this.debug(type + " keeping subscriber " + i, subscribers[i].context);
            }
          } catch (e) {
            this.debug("problem visiting Subscriber " + i, subscribers);
          }
        }
      }
    }
  },

  isAndroidApp: {
    get: function() {

      // Development tablet navigator.userAgent:
      // Mozilla/5.0 (Linux; U; Android 3.0.1; en-us; gTablet Build/HRI66)
      // AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13
      // this.debug("The user agent is " + navigator.userAgent);
      try {
        return navigator.userAgent.indexOf("OfflineAndroidApp") > -1;
      } catch (e) {
        this.warn("Cant determine app type isAndroidApp, " + e);
        return false;
      }
    }
  },

  isAndroid4: {
    get: function() {
      try {
        return navigator.userAgent.indexOf("Android 4") > -1;
      } catch (e) {
        this.warn("Cant determine app type isAndroid4, " + e);
        return false;
      }
    }
  },

  isChromeApp: {
    get: function() {
      try {
        return window.location.href.indexOf("chrome-extension") > -1;
      } catch (e) {
        this.warn("Cant determine app type isChromeApp, " + e);
        return false;
      }
    }
  },

  isCouchApp: {
    get: function() {
      try {
        return window.location.href.indexOf("_design/pages") > -1;
      } catch (e) {
        this.warn("Cant determine app type isCouchApp, " + e);
        return false;
      }
    }
  },

  isTouchDBApp: {
    get: function() {
      try {
        return window.location.href.indexOf("localhost:8128") > -1;
      } catch (e) {
        this.warn("Cant determine app type isTouchDBApp, " + e);
        return false;
      }
    }
  },

  isNodeJSApp: {
    get: function() {
      try {
        return window.location.href !== undefined;
      } catch (e) {
        // this.debug("Cant access window, app type isNodeJSApp, ", e);
        return true;
      }
    }
  },

  isBackboneCouchDBApp: {
    get: function() {
      return false;
    }
  },

  /**
   * If not running offline on an android or in a chrome extension, assume we are
   * online.
   *
   * @returns {Boolean} true if not on offline Android or on a Chrome Extension
   */
  isOnlineOnly: {
    get: function() {
      return !this.isAndroidApp && !this.isChromeApp;
    }
  }


});
exports.App = App;
