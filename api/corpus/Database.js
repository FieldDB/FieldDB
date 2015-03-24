/* globals localStorage */

var Q = require("q");
var CORS = require("../CORS").CORS;
var FieldDBObject = require("../FieldDBObject").FieldDBObject;
// var User = require("../user/User").User;
var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var CorpusConnection = require("./CorpusConnection").CorpusConnection;

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

Database.defaultCouchConnection = CorpusConnection.defaultCouchConnection;

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
      corpusConnection: CorpusConnection
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

  corpusConnection: {
    get: function() {
      if (this._corpusConnection && this._corpusConnection.parent !== this) {
        this._corpusConnection.parent = this;
      }
      return this._corpusConnection;
    },
    set: function(value) {
      this.debug("Setting corpus connection ", value);
      if (Object.prototype.toString.call(value) === "[object Object]") {
        value = new this.INTERNAL_MODELS["corpusConnection"](value);
      }
      this._corpusConnection = value;
      this._corpusConnection.parent = this;
    }
  },

  couchConnection: {
    get: function() {
      this.warn("couchConnection is deprecated, use corpusConnection instead");
      return this.corpusConnection;
    },
    set: function(value) {
      this.warn("couchConnection is deprecated, use corpusConnection instead");
      this.corpusConnection = value;
    }
  },

  url: {
    get: function() {
      if (this.corpusConnection && this.corpusConnection.corpusUrl) {
        return this.corpusConnection.corpusUrl;
      } else {
        if (this.dbname) {
          return this.BASE_DB_URL + "/" + this.dbname;
        }
      }
    },
    set: function(value) {
      this.debug("Setting url  ", value);

      if (!this.corpusConnection) {
        this.corpusConnection = CorpusConnection.defaultCouchConnection(value);
      }

      if (this.dbname && value.indexOf(this.dbname) === -1) {
        this.warn("the url didnt contain this database identifier, that is strange. Adding it to the end", value);
        value = value + "/" + this.dbname;
      }

      this.corpusConnection.corpusUrl = value;
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
        self = this,
        baseUrl;

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
        if (this.application && this.application.corpusConnection && this.application.corpusConnection.corpusUrl) {
          couchSessionUrl = this.application.corpusConnection.corpusUrl;
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
      // this.todo(" Use CorpusConnection ");
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
      // this.todo(" Use CorpusConnection ");

    }
  },


  getCouchUrl: {
    value: function(couchConnection, couchdbcommand) {
      var couchurl = new CorpusConnection(couchConnection).corpusUrl;
      if (couchdbcommand) {
        couchurl = couchurl.replace("/" + couchConnection.pouchname, couchdbcommand);
      }
      return couchurl;
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

        var validateUsername = CorpusConnection.validateIdentifier(details.username);
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
                authserverResult.user.corpora.map(function(corpusConnection) {

                  var addThisServerIfNotAlreadyThere = function(url) {
                    var couchdbSessionUrl = url.replace(corpusConnection.dbname, "_session");
                    if (!self.dbname && corpusServersWhichHouseUsersCorpora.indexOf(couchdbSessionUrl) === -1) {
                      corpusServersWhichHouseUsersCorpora.push(couchdbSessionUrl);
                    } else if (self.dbname && corpusConnection.pouchname === self.dbname && corpusServersWhichHouseUsersCorpora.indexOf(couchdbSessionUrl) === -1) {
                      corpusServersWhichHouseUsersCorpora.push(couchdbSessionUrl);
                    }
                  };

                  if (corpusConnection.corpusUrls) {
                    corpusConnection.corpusUrls.map(addThisServerIfNotAlreadyThere);
                  } else {
                    addThisServerIfNotAlreadyThere(self.getCouchUrl(corpusConnection, "/_session"));
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
        } else if (this.application && this.application.corpusConnection && this.application.corpusConnection.authUrl) {
          optionalAuthUrl = this.application.corpusConnection.authUrl;
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

        var validateUsername = CorpusConnection.validateIdentifier(details.username);
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

        if (!details.corpusConnection) {
          if (self.application && self.application.corpusConnection && self.application.corpusConnection.authUrl) {
            details.corpusConnection = self.application.corpusConnection;
          } else {
            details.corpusConnection = CorpusConnection.defaultCouchConnection(details.authUrl);
          }
          delete details.corpusConnection.dbname;
          delete details.corpusConnection.pouchname;
          delete details.corpusConnection.title;
          delete details.corpusConnection.titleAsUrl;
          delete details.corpusConnection.corpusUrl;
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
      //     dataToPost.couchConnection = window.app.get("corpus").get("couchConnection");
      //     if (!dataToPost.couchConnection.path) {
      //       dataToPost.couchConnection.path = "";
      //       window.app.get("corpus").get("couchConnection").path = "";
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
