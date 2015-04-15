/* globals localStorage */

var Q = require("q");
var CORS = require("../CORS").CORS;
var FieldDBObject = require("../FieldDBObject").FieldDBObject;
// var User = require("../user/User").User;
var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var Connection = require("./Connection").Connection;

var Database = function Database(options) {
  // Let the URLParser be injected
  if (Database.URLParser && !Connection.URLParser) {
    Connection.URLParser = Database.URLParser;
  }

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
      this.debug("getting connection");
      if (this._connection && this._connection.parent !== this) {
        this._connection.parent = this;
      }
      return this._connection;
    },
    set: function(value) {
      if (value) {
        value.parent = this;
        if (!value.confidential && this.confidential) {
          value.confidential = this.confidential;
        }
      }
      this.ensureSetViaAppropriateType("connection", value);
      if (this._connection && this._connection.dbname && this._connection.dbname !== "default" && !this.dbname) {
        this.dbname = this._connection.dbname;
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
      this.warn("Using an unlikely url, as if this app was running in a website where the databse is.");
      return "";
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
    value: function(id, optionalUrl) {
      // if (!this.dbname) {
      //   this.bug("Cannot get something if the dbname is not defined ", id);
      //   throw new Error("Cannot get something if the dbname is not defined ");
      // }
      optionalUrl = optionalUrl || this.url;
      if (!optionalUrl) {
        this.bug("The url could not be extrapolated for this database, that is strange. The app will likely behave abnormally.");
      }
      return CORS.makeCORSRequest({
        method: "GET",
        url: optionalUrl + "/" + id
      });
    }
  },

  set: {
    value: function(arg1, arg2, optionalUrl) {
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
        this.todo("Consider letting users/apps use the optionalUrl in individual save of docs", optionalUrl);
      }
      CORS.makeCORSRequest({
        method: "POST",
        data: value,
        url: this.url
      }).then(function(result) {
        if (!result || !result.ok) {
          result.status = result.status || 400;
          result.userFriendlyErrors = result.userFriendlyErrors || ["This application has errored. Please notify its developers: Cannot save data. If you keep your browser open, you will not loose your work."];
          deferred.reject(result);
          return;
        }
        if (result.rev) {
          value.rev = result.rev;
        }
        if (!value._id) {
          value.id = result.id;
        }
        deferred.resolve(value);
      }, function(reason) {
        if (!reason) {
          reason = {
            status: 400,
            userFriendlyErrors: ["This application has errored. Please notify its developers: Cannot save data. If you keep your browser open, you will not loose your work."]
          };
        }
        reason.details = value;
        self.debug(reason);
        deferred.reject(reason);
      }).fail(function(error) {
        console.error(error.stack, self);
        deferred.reject(error);
      });
      return deferred.promise;
    }
  },

  fetchRevisions: {
    value: function(id, optionalUrl) {
      var deferred = Q.defer(),
        self = this;

      if (!id) {
        Q.nextTick(function() {
          deferred.resolve(self._revisions || []);
        });
        return deferred.promise;
      }

      optionalUrl = optionalUrl || this.url;

      CORS.makeCORSRequest({
        method: "GET",
        url: optionalUrl + "/" + id + "?revs_info=true"
      }).then(function(couchdbResponse) {
        var revisions = [];

        couchdbResponse._revs_info.map(function(revisionInfo) {
          if (revisionInfo.status === "available") {
            revisions.push(optionalUrl + "/" + id + "?rev=\"" + revisionInfo.rev + "\"");
          }
        });

        deferred.resolve(revisions);

      }, function(reason) {
        if (!reason) {
          reason = {
            status: 400,
            userFriendlyErrors: ["This application has errored. Please notify its developers: Cannot save data. If you keep your browser open, you will not loose your work."]
          };
        }
        self.debug(reason);
        deferred.reject(reason);
      }).fail(function(error) {
        console.error(error.stack, self);
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
      throw new Error("Deleting data is not permitted.");
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

      if (key) {
        key = "&key=\"" + key + "\"";
      } else {
        key = "";
      }
      var originalCollectionUrl = collectionUrl;
      var cantLogIn = function(reason) {
        self.debug(reason);
        if (reason.status === 404) {
          if (originalCollectionUrl === collectionUrl) {
            reason.userFriendlyErrors = ["The server didn't know about the collection " + collectionUrl + "you requested. Please try another url."];
          } else {
            reason.userFriendlyErrors = ["The application was unable to request the " + collectionUrl + " collection. Please report this 290323."];
          }
        }
        deferred.reject(reason);
        // self.register().then(function() {
        //   self.fetchCollection(collectionUrl).then(function(documents) {
        //     deferred.resolve(documents);
        //   }, function(reason) {
        //     deferred.reject(reason);
        //   }).fail(function(error) {
        //   console.error(error.stack, self);
        //   deferred.reject(error);
        // });
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
        }, cantLogIn).fail(
          function(error) {
            console.error(error.stack, self);
            deferred.reject(error);
          });

      } else {

        if (collectionUrl.indexOf("/") === -1) {
          collectionUrl = self.url + "/" + self.DEFAULT_COLLECTION_MAPREDUCE.replace("COLLECTION", collectionUrl).replace("LIMIT", 1000) + key;
        } else if (collectionUrl.indexOf("://") === -1) {
          collectionUrl = self.url + "/" + collectionUrl;
        } else {
          this.warn("Fetching data from a user supplied url", collectionUrl);
        }

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
            var datalists = [];
            for (var property in result) {
              if (result.hasOwnProperty(property) && result[property].collection && result[property].collection === "datalists") {
                datalists.push(result[property]);
              }
            }
            if (datalists && datalists.length === 1) {
              deferred.resolve(datalists[0]);
              return datalists[0];
            }
            deferred.resolve(datalists);
            return datalists;
          }
        }, cantLogIn).fail(
          function(error) {
            console.error(error.stack, self);
            deferred.reject(error);
          });
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

      if (this.dbname && couchSessionUrl.indexOf(this.dbname) > 0) {
        couchSessionUrl = couchSessionUrl.replace(this.dbname, "_session");
      } else if (this.connection && this.connection.dbname && couchSessionUrl.indexOf(this.connection.dbname) > 0) {
        couchSessionUrl = couchSessionUrl.replace(this.connection.dbname, "_session");
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
            userFriendlyErrors: ["Please login."],
            status: 401
          });
        }
      }, function(reason) {
        deferred.reject(reason);
      }).fail(function(error) {
        console.error(error.stack, self);
        deferred.reject(error);
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
        this.warn("Localstorage is not available, there will be no connectionInfo persistance across loads");
        this.debug("Localstorage is not available, using the object there will be no persistance across loads", e, this._connectionInfo);
        connectionInfo = this._connectionInfo;
      }
      if (!connectionInfo) {
        return;
      }
      try {
        connectionInfo = new Confidential({
          secretkey: "connectionInfo",
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
      return this.corpusUrl;
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

        var usernameField = "name";
        if (!details.authUrl && details.name) {
          details.authUrl = self.BASE_DB_URL + "/_session";
        }
        details.authUrl = self.deduceAuthUrl(details.authUrl);
        if (details.authUrl.indexOf("/_session") === -1 && details.authUrl.indexOf("/login") === -1) {
          details.authUrl = details.authUrl + "/login";
          usernameField = "username";
        }

        if (!details[usernameField]) {
          deferred.reject({
            details: details,
            userFriendlyErrors: ["Please supply a username."],
            status: 412
          });
          return;
        }

        if (!details.name && details.authUrl.indexOf("/_session") > -1) {
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

        var validateUsername = Connection.validateUsername(details[usernameField]);
        if (validateUsername.changes.length > 0) {
          details[usernameField] = validateUsername.identifier;
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
          url: details.authUrl,
          data: details
        }).then(function(authOrCorpusServerResult) {
            if (authOrCorpusServerResult && authOrCorpusServerResult.user) {
              if (authOrCorpusServerResult.info && authOrCorpusServerResult.info[0] === "Preferences saved." && self.application.authentication) {
                self.application.authentication = "Welcome back " + authOrCorpusServerResult.user.username;
              }
              deferred.resolve(authOrCorpusServerResult.user);
            } else if (authOrCorpusServerResult && authOrCorpusServerResult.roles) {
              deferred.resolve(authOrCorpusServerResult);
            } else {
              authOrCorpusServerResult = authOrCorpusServerResult || {};
              authOrCorpusServerResult.userFriendlyErrors = authOrCorpusServerResult.userFriendlyErrors || [" Unknown response from server, please report this."];
              deferred.reject(authOrCorpusServerResult);
            }
          },
          function(reason) {
            reason.details = details;
            self.debug(reason);
            deferred.reject(reason);
          }).fail(
          function(reason) {
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

      if (!optionalUrl || optionalUrl.indexOf("/_session") === -1 || optionalUrl.lastIndexOf("/_session") !== optionalUrl.length - ("/_session").length) {
        Q.nextTick(function() {
          deferred.reject({
            userFriendlyErrors: ["You cannot log out of " + optionalUrl + " using this application."],
            status: 412
          });
        });
        return deferred.promise;
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
        self.debug(reason);
        deferred.reject(reason);
      }).fail(function(error) {
        console.error(error.stack, self);
        error.status = error.status || 400;
        error.userFriendlyErrors = error.userFriendlyErrors || ["Unknown error, please report this 8912."];
        deferred.reject(error);
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
            confirmPassword: "testtest",
            connection: new Connection(Connection.knownConnections.production)
          };
          details.authUrl = details.connection.authUrl;
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

        var validateUsername = Connection.validateUsername(details.username);
        if (validateUsername.changes.length > 0) {
          details.username = validateUsername.identifier;
          self.warn(" Invalid username ", validateUsername.changes.join("\n "));
          deferred.reject({
            error: validateUsername,
            details: details,
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

        if (!details.appbrand && self.application && self.application.brandLowerCase) {
          details.appbrand = self.application.brandLowerCase;
        }
        details.appVersionWhenCreated = self.version;

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
              details: details,
              userFriendlyErrors: result.userFriendlyErrors || ["Unknown error. Please report this 2391."]
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
          reason.details = reason.details || details;
          self.debug(reason);
          deferred.reject(reason);
        }).fail(function(error) {
          console.error(error.stack, self);
          error.status = error.status || 400;
          error.details = error.details || details;
          error.userFriendlyErrors = error.userFriendlyErrors || ["Unknown error, please report this 1289128."];
          deferred.reject(error);
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
          }).fail(function(error) {
            console.error(error.stack, self);
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

var FieldDBConnection = FieldDBConnection || {};
FieldDBConnection.CORS = CORS;

FieldDBConnection.setXMLHttpRequestLocal = function(injectedCORS) {
  FieldDBConnection.CORS = injectedCORS;
};

FieldDBConnection.connection = {
  localCouch: {
    connected: false,
    url: "https://localhost:6984",
    couchUser: null
  },
  centralAPI: {
    connected: false,
    url: "https://localhost:3183",
    fieldDBUser: null
  }
};

FieldDBConnection.connect = function() {
  var deferred = Q.defer();

  if (this.timestamp && this.connection.couchUser && this.connection.fieldDBUser && Date.now() - this.timestamp < 1000) {
    console.log("connection information is not old.");
    Q.nextTick(function() {
      deferred.resolve(this.connection);
    });
    return deferred.promise;
  }

  var deferredLocal = Q.defer(),
    deferredCentral = Q.defer(),
    promises = [deferredLocal.promise, deferredCentral.promise],
    self = this;

  // Find out if this user is able to work offline with a couchdb
  FieldDBConnection.CORS.makeCORSRequest({
    method: "GET",
    dataType: "json",
    url: self.connection.localCouch.url + "/_session"
  }).then(function(response) {
    this.timestamp = Date.now();
    console.log(response);

    if (!response || !response.userCtx) {
      self.connection.localCouch.connected = false;
      self.connection.localCouch.timestamp = Date.now();
      deferredLocal.reject({
        eror: "Recieved an odd response from the local couch. Can\"t contact the local couchdb, it might be off or it might not be installed. This device can work online only."
      });
      return;
    }

    self.connection.localCouch.connected = true;
    self.connection.localCouch.timestamp = Date.now();
    self.connection.localCouch.couchUser = response.userCtx;
    if (!response.userCtx.name) {
      FieldDBConnection.CORS.makeCORSRequest({
        method: "POST",
        dataType: "json",
        data: {
          name: "public",
          password: "none"
        },
        url: self.connection.localCouch.url + "/_session"
      }).then(function() {
        console.log("Logged the user in as the public user so they can only see public info.");
        deferredLocal.resolve(response);

      }).fail(function(reason) {
        console.log("The public user doesnt exist on this couch...", reason);
        deferredLocal.reject(reason);
      });
    }

  }).fail(function(reason) {
    this.timestamp = Date.now();
    console.log(reason);
    self.connection.localCouch.connected = false;
    self.connection.localCouch.timestamp = Date.now();
    deferredLocal.reject(reason);
  });

  // Find out if this user is able to work online with the central api
  FieldDBConnection.CORS.makeCORSRequest({
    method: "GET",
    dataType: "json",
    url: self.connection.centralAPI.url + "/users"
  }).then(function(response) {
    this.timestamp = Date.now();
    console.log("FieldDBConnection", response);

    if (!response || !response.user) {
      self.connection.centralAPI.connected = false;
      self.connection.centralAPI.timestamp = Date.now();
      deferredCentral.reject({
        eror: "Received an odd response from the api. Can\"t contact the api server. This is a bug which must be reported."
      });
      return;
    }

    self.connection.centralAPI.connected = true;
    self.connection.centralAPI.timestamp = Date.now();
    self.connection.localCouch.user = response.user;
    if (!response.user.username) {
      FieldDBConnection.CORS.makeCORSRequest({
        method: "POST",
        dataType: "json",
        data: {
          username: "public",
          password: "none"
        },
        url: self.connection.centralAPI.url + "/users"
      }).then(function() {
        console.log("Logged the user in as the public user so they can only see public info.");
        deferredCentral.resolve(response);

      }).fail(function(reason) {
        console.log("The public user doesn\"t exist on this couch...", reason);
        deferredCentral.reject(reason);
      });
    }

  }).fail(function(reason) {
    this.timestamp = Date.now();
    console.log(reason);
    self.connection.centralAPI.connected = false;
    self.connection.centralAPI.timestamp = Date.now();
    deferredCentral.reject(reason);
  });

  Q.allSettled(promises).then(function(results) {
    console.log(results);
    deferred.resolve(this.connection);
  });

  return deferred.promise;

};

exports.FieldDBConnection = FieldDBConnection;


var CouchDBConnection = function(url, user) {
  this.url = url;
  this.user = user;
  this.result = {};
  this.uploadResult = {};
  this.login = function(optionalCallback) {

    var that = this;
    CORS.makeCORSRequest({
      type: "POST",
      url: that.url,
      data: that.user,
      success: function(serverResults) {
        that.result = serverResults;
        console.log("server contacted", serverResults);
        if (typeof optionalCallback === "function") {
          optionalCallback();
        }
      },
      error: function(serverResults) {
        that.result = serverResults;
        console
          .log("There was a problem contacting the server to login.");
      }
    });
  };
  this.uploadADocument = function(doc, database, optionalCallback) {
    var that = this;
    that.uploadResult = {};
    var method = "POST";
    var uploadURLSuffix = database;
    if (doc.id) {
      method = "PUT";
      uploadURLSuffix = database + "/" + doc._id;
    }
    var upload = function() {
      CORS
        .makeCORSRequest({
          type: method,
          url: that.url.replace("_session", uploadURLSuffix),
          data: doc,
          success: function(serverResults) {
            that.uploadResult = serverResults;
            console.log("server contacted", serverResults);
            if (typeof optionalCallback === "function") {
              optionalCallback();
            }
          },
          error: function(serverResults) {
            that.uploadResult = serverResults;
            console
              .log("There was a problem contacting the server to upload.");
          }
        });
    };

    /*
     * Run the upload, log the user in, if they aren't already.
     */
    if (!this.loggedIn) {
      this.login(upload);
    } else {
      upload();
    }
  };
  this.docUploaded = function() {
    return this.uploadResult.ok;
  };
  this.loggedIn = function() {
    return this.result.name === this.user.name;
  };
  this.assertLoginSuccessful = function() {
    expect(this.result.name).toEqual(this.user.name);
  };
  this.assertUploadSuccessful = function() {
    expect(this.uploadResult.ok).toBeTruthy();
  };
};

exports.CouchDBConnection = CouchDBConnection;
