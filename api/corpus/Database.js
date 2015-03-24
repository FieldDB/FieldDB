/* globals localStorage */

var Q = require("q");
var CORS = require("../CORS").CORS;
var FieldDBObject = require("../FieldDBObject").FieldDBObject;
// var User = require("../user/User").User;
var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var Connection = require("./Connection").Connection;

var Database = function Database(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Database";
  }
  this.debug("In Database ", options);
  FieldDBObject.apply(this, arguments);
};

var DEFAULT_COLLECTION_MAPREDUCE = "_design/pages/_view/COLLECTION?descending=true&limit=LIMIT";
var DEFAULT_BASE_AUTH_URL = "https://localhost:3183";
var DEFAULT_BASE_DB_URL = "https://localhost:6984";

Database.defaultConnection = Connection.defaultConnection;

/**
 * This limit is set to protect apps from requesting huge amounts of data without pagination.
 * @type {Number}
 */
Database.DEFAULT_DOCUMENT_LIMIT = 1000;

Database.prototype = Object.create(FieldDBObject.prototype, /** @lends Database.prototype */ {
  constructor: {
    value: Database
  },

  fieldDBtype: {
    get: function() {
      return this._fieldDBtype || "Database";
    },
    set: function(value) {
      if (value !== this.fieldDBtype) {
        this.debug("Using type " + this.fieldDBtype + " when the incoming object was " + value);
      }
    }
  },

  INTERNAL_MODELS: {
    value: {
      connection: Connection
    }
  },

  DEFAULT_COLLECTION_MAPREDUCE: {
    value: DEFAULT_COLLECTION_MAPREDUCE
  },

  BASE_AUTH_URL: {
    get: function() {
      return DEFAULT_BASE_AUTH_URL;
    },
    set: function(value) {
      DEFAULT_BASE_AUTH_URL = value;
    }
  },

  BASE_DB_URL: {
    get: function() {
      return DEFAULT_BASE_DB_URL;
    },
    set: function(value) {
      DEFAULT_BASE_DB_URL = value;
    }
  },

  connection: {
    get: function() {
      if (this._connection && this._connection.parent !== this) {
        this._connection.parent = this;
      }
      return this._connection;
    },
    set: function(value) {
      this.debug("Setting corpus connection ", value);
      if (Object.prototype.toString.call(value) === "[object Object]") {
        value = new this.INTERNAL_MODELS["connection"](value);
      }
      this._connection = value;
      this._connection.parent = this;
      if (!this.dbname && value.dbname) {
        this.dbname = value.dbname;
      }
    }
  },

  url: {
    get: function() {
      if (this.connection && this.connection.corpusUrl) {
        return this.connection.corpusUrl;
      } else {
        if (this.dbname) {
          return this.BASE_DB_URL + "/" + this.dbname;
        }
      }
    },
    set: function(value) {
      this.debug("Setting url  ", value);

      if (!this.connection) {
        this.connection = Connection.defaultConnection(value);
      }

      if (this.dbname && value.indexOf(this.dbname) === -1) {
        this.warn("the url didnt contain this database identifier, that is strange. Adding it to the end", value);
        value = value + "/" + this.dbname;
      }

      this.connection.corpusUrl = value;
    }
  },

  get: {
    value: function(id) {
      if (!this.dbname) {
        this.bug("Cannot get something if the dbname is not defined ", id);
        throw new Error("Cannot get something if the dbname is not defined ");
      }
      if (!this.url) {
        this.bug("The url could not be extrapolated for this database, that is strange. The app will likely behave abnormally.");
      }
      return CORS.makeCORSRequest({
        method: "GET",
        url: this.url + "/" + id
      });
    }
  },

  set: {
    value: function(arg1, arg2) {
      if (!this.dbname) {
        this.bug("Cannot get something if the dbname is not defined ", arg1, arg2);
        throw new Error("Cannot get something if the dbname is not defined ");
      }
      var deferred = Q.defer(),
        self = this,
        key,
        value;

      if (!arg2) {
        value = arg1;
      } else {
        key = arg1;
        value = arg2;
        value.id = key;
      }
      if (!this.url) {
        this.bug("the url could not be extrapolated for this database, that is strange. The app will likely behave abnormally.");
      }
      CORS.makeCORSRequest({
        method: "POST",
        data: value,
        url: this.url
      }).then(function(result) {
        if (result._rev) {
          value._rev = result._rev;
          value.rev = result._rev;
        }
        if (!value._id) {
          value._id = result._id;
          value.id = result._id;
        }
        deferred.resolve(value);
      }, function(error) {
        self.warn("error saving " + error);
        deferred.reject(error);
      });
      return deferred.promise;
    }
  },

  delete: {
    value: function(options) {
      return this.remove(options);
    }
  },

  remove: {
    value: function(options) {
      this.bug("Deleting data is not permitted.", options);
      throw "Deleting data is not permitted.";
    }
  },

  fetchAllDocuments: {
    value: function() {
      return this.fetchCollection("datums");
    }
  },

  fetchCollection: {
    value: function(collectionUrl, start, end, limit, reduce, key) {
      // this.todo("Provide pagination ", start, end, limit, reduce);
      var deferred = Q.defer(),
        self = this;

      if (!collectionUrl) {
        Q.nextTick(function() {
          deferred.reject({
            status: 406,
            userFriendlyErrors: ["This application has errored. Please notify its developers: Cannot fetch data url."]
          });
        });
        return deferred.promise;
      }

      if (collectionUrl.indexOf("/") === -1) {
        collectionUrl = self.couchSessionUrl + "/" + self.DEFAULT_COLLECTION_MAPREDUCE.replace("COLLECTION", collectionUrl).replace("LIMIT", 1000) + key;
      } else if (collectionUrl.indexOf("://") === -1) {
        collectionUrl = self.couchSessionUrl + "/" + collectionUrl;
      } else {
        this.warn("Fetching data from a user supplied url", collectionUrl);
      }

      if (key) {
        key = "&key=\"" + key + "\"";
      } else {
        key = "";
      }

      var cantLogIn = function(reason) {
        self.debug(reason);
        deferred.reject(reason);
        // self.register().then(function() {
        //   self.fetchCollection(collectionUrl).then(function(documents) {
        //     deferred.resolve(documents);
        //   }, function(reason) {
        //     deferred.reject(reason);
        //   });
        // });
      };


      // CORS.makeCORSRequest({
      //   type: "POST",
      //   dataType: "json",
      //   url: self.url + "/_session",
      //   data: {
      //     name: self.dbname.split("-")[0],
      //     password: "testtest"
      //   }
      // }).then(function(session) {

      if (Object.prototype.toString.call(collectionUrl) === "[object Array]") {
        var promises = [];
        collectionUrl.map(function(id) {
          promises.push(CORS.makeCORSRequest({
            type: "GET",
            dataType: "json",
            url: self.url + "/" + id
          }));
        });

        Q.allSettled(promises).then(function(results) {
          self.debug(results);
          if (results.length) {
            deferred.resolve(results.map(function(result) {
              if (result.state === "fulfilled") {
                return result.value;
              } else {
                return {};
              }
            }));
          } else {
            deferred.resolve([]);
          }
        }, cantLogIn);

      } else {
        CORS.makeCORSRequest({
          type: "GET",
          dataType: "json",
          url: collectionUrl
        }).then(function(result) {
          if (result.rows && result.rows.length) {
            deferred.resolve(result.rows.map(function(doc) {
              return doc.value;
            }));
          } else {
            deferred.resolve([]);
          }
        }, cantLogIn);
      }

      // }, cantLogIn);
      return deferred.promise;
    }
  },

  couchSessionUrl: {
    get: function() {
      var couchSessionUrl = this.url;
      if (!couchSessionUrl) {
        if (this.application && this.application.connection && this.application.connection.corpusUrl) {
          couchSessionUrl = this.application.connection.corpusUrl;
        } else if (this.connection && this.connection.corpusUrl) {
          couchSessionUrl = this.connection.corpusUrl;
        } else {
          couchSessionUrl = this.BASE_DB_URL;
        }
      }

      if (couchSessionUrl.indexOf(this.dbname) > 0) {
        couchSessionUrl = couchSessionUrl.replace(this.dbname, "_session");
      } else {
        couchSessionUrl = couchSessionUrl + "/_session";
      }

      return couchSessionUrl;
    }
  },

  resumeAuthenticationSession: {
    value: function() {
      var deferred = Q.defer(),
        self = this;

      CORS.makeCORSRequest({
        type: "GET",
        dataType: "json",
        url: this.couchSessionUrl
      }).then(function(sessionInfo) {
        self.debug(sessionInfo);
        self.connectionInfo = sessionInfo;
        if (sessionInfo.userCtx.name) {
          // var user = new User({
          //   username: sessionInfo.userCtx.name
          // }).fetch();
          deferred.resolve({
            username: sessionInfo.userCtx.name,
            roles: sessionInfo.userCtx.roles
          });
        } else {
          deferred.reject({
            error: sessionInfo,
            userFriendlyErrors: ["Please log in"],
            status: 409
          });
        }
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    }
  },

  connectionInfo: {
    get: function() {
      var connectionInfo;
      try {
        connectionInfo = localStorage.getItem("_connectionInfo");
      } catch (e) {
        this.warn("Localstorage is not available, using the object there will be no persistance across loads");
        this.debug("Localstorage is not available, using the object there will be no persistance across loads", e, this._connectionInfo);
        connectionInfo = this._connectionInfo;
      }
      if (!connectionInfo) {
        return;
      }
      try {
        connectionInfo = new Confidential({
          secretkey: "connectionInfo"
        }).decrypt(connectionInfo);
      } catch (e) {
        this.warn("unable to read the connectionInfo info, ", e, this._connectionInfo);
        connectionInfo = undefined;
      }
      // this.todo(" Use Connection ");
      return connectionInfo;
    },
    set: function(value) {
      if (value) {
        try {
          localStorage.setItem("_connectionInfo", new Confidential({
            secretkey: "connectionInfo"
          }).encrypt(value));
        } catch (e) {
          this._connectionInfo = new Confidential({
            secretkey: "connectionInfo"
          }).encrypt(value);
          this.debug("Localstorage is not available, using the object there will be no persistance across loads", e, this._connectionInfo);
        }
      } else {
        try {
          localStorage.removeItem("_connectionInfo");
        } catch (e) {
          this.debug("Localstorage is not available, using the object there will be no persistance across loads", e, this._connectionInfo);
          delete this._connectionInfo;
        }
      }
      // this.todo(" Use Connection ");

    }
  },


  getCouchUrl: {
    value: function() {
      return this.connectioncorpusUrl;
    }
  },

  login: {
    value: function(details) {
      var deferred = Q.defer(),
        self = this;

      Q.nextTick(function() {

        if (!details) {
          deferred.reject({
            details: details,
            userFriendlyErrors: ["This application has errored, please contact us."],
            status: 412
          });
          return;
        }

        details.authUrl = self.deduceAuthUrl(details.authUrl);

        if (!details.username) {
          deferred.reject({
            details: details,
            userFriendlyErrors: ["Please supply a username."],
            status: 412
          });
          return;
        }
        if (!details.password) {
          deferred.reject({
            details: details,
            userFriendlyErrors: ["Please supply a password."],
            status: 412
          });
          return;
        }

        var validateUsername = Connection.validateIdentifier(details.username);
        if (validateUsername.changes.length > 0) {
          details.username = validateUsername.identifier;
          self.warn(" Invalid username ", validateUsername.changes.join("\n "));
          deferred.reject({
            error: validateUsername,
            userFriendlyErrors: validateUsername.changes,
            status: 412
          });
          return;
        }

        CORS.makeCORSRequest({
          type: "POST",
          dataType: "json",
          url: details.authUrl + "/login",
          data: details
        }).then(function(authserverResult) {
            if (authserverResult.user) {
              var corpusServersWhichHouseUsersCorpora = [];
              self.todo("move the logic to connect to all the users corpora to the authentication level instead.");
              if (authserverResult.user.corpora && authserverResult.user.corpora[0]) {
                authserverResult.user.corpora.map(function(connection) {
                  connection.dbname = connection.dbname || connection.pouchname;
                  var addThisServerIfNotAlreadyThere = function(url) {
                    var couchdbSessionUrl = url.replace(connection.dbname, "_session");
                    if (!self.dbname && corpusServersWhichHouseUsersCorpora.indexOf(couchdbSessionUrl) === -1) {
                      corpusServersWhichHouseUsersCorpora.push(couchdbSessionUrl);
                    } else if (self.dbname && connection.dbname === self.dbname && corpusServersWhichHouseUsersCorpora.indexOf(couchdbSessionUrl) === -1) {
                      corpusServersWhichHouseUsersCorpora.push(couchdbSessionUrl);
                    }
                  };

                  if (connection.corpusUrls) {
                    connection.corpusUrls.map(addThisServerIfNotAlreadyThere);
                  } else {
                    addThisServerIfNotAlreadyThere(self.getCouchUrl(connection, "/_session"));
                  }

                });
              }

              if (corpusServersWhichHouseUsersCorpora.length < 1) {
                this.warn("This user has no corpora, this is strange.");
              }
              self.debug("Requesting session token for all corpora user has access to.");
              var promises = [];
              authserverResult.user.roles = [];
              for (var corpusUrlIndex = 0; corpusUrlIndex < corpusServersWhichHouseUsersCorpora.length; corpusUrlIndex++) {
                promises.push(CORS.makeCORSRequest({
                  type: "POST",
                  dataType: "json",
                  url: corpusServersWhichHouseUsersCorpora[corpusUrlIndex],
                  data: {
                    name: authserverResult.user.username,
                    password: details.password
                  }
                }));
              }

              Q.allSettled(promises).then(function(results) {
                results.map(function(result) {
                  if (result.state === "fulfilled") {
                    authserverResult.user.roles = authserverResult.user.roles.concat(result.value.roles);
                  } else {
                    self.debug("Failed to login to one of the users's corpus servers ", result);
                  }
                });
                deferred.resolve(authserverResult.user);
              });

              // .then(function(sessionInfo) {
              //   // self.debug(sessionInfo);
              //   result.user.roles = sessionInfo.roles;
              //   deferred.resolve(result.user);
              // }, function() {
              //   self.debug("Failed to login ");
              //   deferred.reject("Something is wrong.");
              // });
            } else {
              deferred.reject(authserverResult.userFriendlyErrors.join(" "));
            }
          },
          function(reason) {
            reason.details = details;
            self.debug(reason);
            deferred.reject(reason);
          }).fail(function(reason) {
          self.debug(reason);
          deferred.reject(reason);
        });
      });
      return deferred.promise;
    }
  },

  logout: {
    value: function(optionalUrl) {
      var deferred = Q.defer(),
        self = this;

      if (!optionalUrl) {
        optionalUrl = this.couchSessionUrl;
      }

      CORS.makeCORSRequest({
        type: "DELETE",
        dataType: "json",
        url: optionalUrl
      }).then(function(result) {
        if (result.ok) {
          self.connectionInfo = null;
          deferred.resolve(result);
        } else {
          deferred.reject(result);
        }
      }, function(reason) {
        reason = reason || {};
        reason.status = reason.status || 400;
        reason.userFriendlyErrors = reason.userFriendlyErrors || ["Unknown error, please report this."];
        self.debug(reason);
        deferred.reject(reason);
      });
      return deferred.promise;
    }
  },

  deduceAuthUrl: {
    value: function(optionalAuthUrl) {
      if (!optionalAuthUrl) {
        if (this.authUrl) {
          optionalAuthUrl = this.authUrl;
        } else if (this.application && this.application.connection && this.application.connection.authUrl) {
          optionalAuthUrl = this.application.connection.authUrl;
        } else {
          optionalAuthUrl = this.BASE_AUTH_URL;
        }
      }
      return optionalAuthUrl;
    }
  },

  register: {
    value: function(details) {
      var deferred = Q.defer(),
        self = this;

      Q.nextTick(function() {

        if (!details && self.dbname && self.dbname.split("-").length === 2) {
          details = {
            username: self.dbname.split("-")[0],
            password: "testtest",
            confirmPassword: "testtest"
          };
        }

        if (!details) {
          deferred.reject({
            details: details,
            userFriendlyErrors: ["This application has errored, please contact us."],
            status: 412
          });
          return;
        }

        details.authUrl = self.deduceAuthUrl(details.authUrl);

        if (!details.username) {
          deferred.reject({
            details: details,
            userFriendlyErrors: ["Please supply a username."],
            status: 412
          });
          return;
        }
        if (!details.password) {
          deferred.reject({
            details: details,
            userFriendlyErrors: ["Please supply a password."],
            status: 412
          });
          return;
        }

        if (!details.confirmPassword) {
          deferred.reject({
            details: details,
            userFriendlyErrors: ["Please confirm your password."],
            status: 412
          });
          return;
        }

        if (details.confirmPassword !== details.password) {
          deferred.reject({
            details: details,
            userFriendlyErrors: ["Passwords don't match, please double check your password."],
            status: 412
          });
          return;
        }

        var validateUsername = Connection.validateIdentifier(details.username);
        if (validateUsername.changes.length > 0) {
          details.username = validateUsername.identifier;
          self.warn(" Invalid username ", validateUsername.changes.join("\n "));
          deferred.reject({
            error: validateUsername,
            userFriendlyErrors: validateUsername.changes,
            status: 412
          });
          return;
        }

        if (!details.connection) {
          if (self.application && self.application.connection && self.application.connection.authUrl) {
            details.connection = self.application.connection;
          } else {
            details.connection = Connection.defaultConnection(details.authUrl);
          }
          delete details.connection.dbname;
          delete details.connection.pouchname;
          delete details.connection.title;
          delete details.connection.titleAsUrl;
          delete details.connection.corpusUrl;
        }

        if (self.application && self.application.brandLowerCase) {
          details.appbrand = self.application.brandLowerCase;
          details.appVersionWhenCreated = self.application.version;
        }

        CORS.makeCORSRequest({
          type: "POST",
          dataType: "json",
          url: details.authUrl + "/register",
          data: details
        }).then(function(result) {
          self.debug("registration results", result);

          if (!result.user) {
            deferred.reject({
              error: result,
              status: 500,
              userFriendlyErrors: ["Unknown error. Please report this 2391."]
            });
            return;
          }

          deferred.resolve(result.user);
          //dont automatically login, let the client side decide what to do.
          // self.login(details).then(function(result) {
          // deferred.resolve(result);
          // }, function(error) {
          //   self.debug("Failed to login ");
          //   deferred.reject(error);
          // });
        }, function(reason) {
          reason = reason || {};
          reason.details = details;
          reason.status = reason.status || 400;
          reason.userFriendlyErrors = reason.userFriendlyErrors || ["Unknown error, please report this."];
          self.debug(reason);
          deferred.reject(reason);
        });

      });
      return deferred.promise;
    }
  },

  /**
   * Synchronize to server and from database.
   */
  replicateContinuouslyWithCouch: {
    value: function(successcallback, failurecallback) {
      var self = this;
      if (!self.pouch) {
        self.debug("Not replicating, no pouch ready.");
        if (typeof successcallback === "function") {
          successcallback();
        }
        return;
      }
      self.pouch(function(err, db) {
        var couchurl = self.connection.couchUrl;
        if (err) {
          self.debug("Opening db error", err);
          if (typeof failurecallback === "function") {
            failurecallback();
          } else {
            this.bug("Opening DB error" + JSON.stringify(err));
            self.debug("Opening DB error" + JSON.stringify(err));
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
    value: function(connection, successcallback, failurecallback) {
      var self = this;

      if (!self.pouch) {
        self.debug("Not replicating, no pouch ready.");
        if (typeof successcallback === "function") {
          successcallback();
        }
        return;
      }

      self.pouch(function(err, db) {
        var couchurl = self.connection.corpusUrl;
        if (err) {
          self.debug("Opening db error", err);
          if (typeof failurecallback === "function") {
            failurecallback();
          } else {
            self.bug("Opening DB error" + JSON.stringify(err));
            self.debug("Opening DB error" + JSON.stringify(err));
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
                self.bug("Corpus replicate from error" + JSON.stringify(err));
                self.debug("Corpus replicate from error" + JSON.stringify(err));
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
            self.bug("Database replicate to error" + JSON.stringify(err));
            self.debug("Database replicate to error" + JSON.stringify(err));
          }
        } else {
          self.debug("Database replicate to success", response);
          if (typeof success === "function") {
            success();
          } else {
            self.debug("Database replicating" + JSON.stringify(self.connection));
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
              self.bug("Database replicate from error" + JSON.stringify(err));
              self.debug("Database replicate from error" + JSON.stringify(err));
            }
          } else {
            self.debug("Database replicate from success",
              response);
            if (typeof succes === "function") {
              succes();
            } else {
              self.debug("Database replicating" + JSON.stringify(self.connection));
            }
          }
        });
    }
  },

  /*
   * This will be the only time the app should open the pouch.
   */
  changePouch: {
    value: function(connection, callback) {
      if (this.pouch === undefined) {
        // this.pouch = FieldDBObject.sync.pouch("https://localhost:6984/" + connection.dbname);
        this.pouch = FieldDBObject.sync.pouch(this.isAndroidApp() ? connection.touchUrl + connection.dbname : connection.pouchUrl + connection.dbname);
      }
      if (typeof callback === "function") {
        callback();
      }
    }
  },

  addCorpusRoleToUser: {
    value: function(role, userToAddToCorpus, successcallback, failcallback) {
      this.debug("deprecated ", role, userToAddToCorpus, successcallback, failcallback);
      // var self = this;
      // $("#quick-authenticate-modal").modal("show");
      // if (this.user.username === "lingllama") {
      //   $("#quick-authenticate-password").val("phoneme");
      // }
      // window.hub.subscribe("quickAuthenticationClose", function() {

      //   //prepare data and send it
      //   var dataToPost = {};
      //   var authUrl = "";
      //   if (this.user !== undefined) {
      //     //Send username to limit the requests so only valid users can get a user list
      //     dataToPost.username = this.user.username;
      //     dataToPost.password = $("#quick-authenticate-password").val();
      //     dataToPost.connection = window.app.get("corpus").get("connection");
      //     if (!dataToPost.connection.path) {
      //       dataToPost.connection.path = "";
      //       window.app.get("corpus").get("connection").path = "";
      //     }
      //     dataToPost.roles = [role];
      //     dataToPost.userToAddToRole = userToAddToCorpus.username;

      //     authUrl = this.user.authUrl;
      //   } else {
      //     return;
      //   }
      //   CORS.makeCORSRequest({
      //     type: "POST",
      //     url: authUrl + "/addroletouser",
      //     data: dataToPost,
      //     success: function(serverResults) {
      //       if (serverResults.userFriendlyErrors !== null) {
      //         self.debug("User " + userToAddToCorpus.username + " not added to the corpus as " + role);
      //         if (typeof failcallback === "function") {
      //           failcallback(serverResults.userFriendlyErrors.join("<br/>"));
      //         }
      //       } else if (serverResults.roleadded !== null) {
      //         self.debug("User " + userToAddToCorpus.username + " added to the corpus as " + role);
      //         if (typeof successcallback === "function") {
      //           successcallback(userToAddToCorpus);
      //         }
      //       }
      //     }, //end successful fetch
      //     error: function(e) {
      //       self.debug("Ajax failed, user might be offline (or server might have crashed before replying).", e);

      //       if (typeof failcallback === "function") {
      //         failcallback("There was an error in contacting the authentication server to add " + userToAddToCorpus.username + " on your corpus team. Maybe you're offline?");
      //       }
      //     },
      //     dataType: ""
      //   });
      //   //end send call

      //   //Close the modal
      //   $("#quick-authenticate-modal").modal("hide");
      //   $("#quick-authenticate-password").val("");
      //   window.hub.unsubscribe("quickAuthenticationClose", null, this);
      // }, self);
    }
  }
});

exports.Database = Database;
