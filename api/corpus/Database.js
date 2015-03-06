/* globals localStorage, window */

var Q = require("q");
var CORS = require("../CORS").CORS;
var FieldDBObject = require("../FieldDBObject").FieldDBObject;
var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;

var Database = function Database(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Database";
  }
  this.debug("In Database ", options);
  FieldDBObject.apply(this, arguments);
};

var DEFAULT_COLLECTION_MAPREDUCE = "_design/pages/_view/COLLECTION?descending=true";
var DEFAULT_BASE_AUTH_URL = "https://localhost:3183";
var DEFAULT_BASE_DB_URL = "https://localhost:6984";
Database.prototype = Object.create(FieldDBObject.prototype, /** @lends Database.prototype */ {
  constructor: {
    value: Database
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

  get: {
    value: function(id) {
      if (!this.dbname) {
        this.bug("Cannot get something if the dbname is not defined ", id);
        throw "Cannot get something if the dbname is not defined ";
      }
      var baseUrl = this.url;
      if (!baseUrl) {
        baseUrl = this.BASE_DB_URL;
      }
      return CORS.makeCORSRequest({
        method: "GET",
        url: baseUrl + "/" + this.dbname + "/" + id
      });
    }
  },

  set: {
    value: function(arg1, arg2) {
      if (!this.dbname) {
        this.bug("Cannot get something if the dbname is not defined ", arg1, arg2);
        throw "Cannot get something if the dbname is not defined ";
      }
      var deferred = Q.defer(),
        baseUrl = this.url,
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
      if (!baseUrl) {
        baseUrl = this.BASE_DB_URL;
      }
      CORS.makeCORSRequest({
        method: "POST",
        data: value,
        url: baseUrl + "/" + this.dbname
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
    value: function(collectionType, start, end, limit, reduce, key) {
      this.todo("Provide pagination ", start, end, limit, reduce);
      var deferred = Q.defer(),
        self = this,
        baseUrl = this.url;

      if (!baseUrl) {
        baseUrl = this.BASE_DB_URL;
        // Q.nextTick(function() {
        //   deferred.reject("Cannot fetch data with out a url");
        // });
        // return deferred.promise;
      }

      if (!collectionType) {
        Q.nextTick(function() {
          deferred.reject("Cannot fetch data with out a collectionType (eg consultants, sessions, datalists)");
        });
        return deferred.promise;
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
        //   self.fetchCollection(collectionType).then(function(documents) {
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

      if (Object.prototype.toString.call(collectionType) === "[object Array]") {
        var promises = [];
        collectionType.map(function(id) {
          promises.push(CORS.makeCORSRequest({
            type: "GET",
            dataType: "json",
            url: baseUrl + "/" + self.dbname + "/" + id
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
          url: baseUrl + "/" + self.dbname + "/" + self.DEFAULT_COLLECTION_MAPREDUCE.replace("COLLECTION", collectionType) + key
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

  resumeAuthenticationSession: {
    value: function() {
      var deferred = Q.defer(),
        baseUrl = this.url,
        self = this;

      if (!baseUrl) {
        baseUrl = this.BASE_DB_URL;
      }

      CORS.makeCORSRequest({
        type: "GET",
        dataType: "json",
        url: baseUrl + "/_session"
      }).then(function(sessionInfo) {
        self.debug(sessionInfo);
        self.connectionInfo = sessionInfo;
        deferred.resolve(sessionInfo);
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
    }
  },

  /*
   * This function is the same in all webservicesconfig, now any couchapp can
   * login to any server, and register on the corpus server which matches its
   * origin.
   */
  defaultCouchConnection: {
    value: function() {
      var localhost = {
        protocol: "https://",
        domain: "localhost",
        port: "6984",
        pouchname: "default",
        path: "",
        authUrl: "https://localhost:3183",
        userFriendlyServerName: "Localhost"
      };
      var testing = {
        protocol: "https://",
        domain: "corpusdev.lingsync.org",
        port: "443",
        pouchname: "default",
        path: "",
        authUrl: "https://authdev.lingsync.org",
        userFriendlyServerName: "LingSync Beta"
      };
      var production = {
        protocol: "https://",
        domain: "corpus.lingsync.org",
        port: "443",
        pouchname: "default",
        path: "",
        authUrl: "https://auth.lingsync.org",
        userFriendlyServerName: "LingSync.org"
      };
      //v1.90 all users are on production
      testing = production;

      var mcgill = {
        protocol: "https://",
        domain: "corpus.lingsync.org",
        port: "443",
        pouchname: "default",
        path: "",
        authUrl: "https://auth.lingsync.org",
        userFriendlyServerName: "McGill ProsodyLab"
      };

      /*
       * If its a couch app, it can only contact databases on its same origin, so
       * modify the domain to be that origin. the chrome extension can contact any
       * authorized server that is authorized in the chrome app's manifest
       */
      var connection = production;

      if (window.location.origin.indexOf("_design/pages") > -1) {
        if (window.location.origin.indexOf("corpusdev.lingsync.org") >= 0) {
          connection = testing;
        } else if (window.location.origin.indexOf("lingsync.org") >= 0) {
          connection = production;
        } else if (window.location.origin.indexOf("prosody.linguistics.mcgill") >= 0) {
          connection = mcgill;
        } else if (window.location.origin.indexOf("localhost") >= 0) {
          connection = localhost;
        }
      } else {
        if (window.location.origin.indexOf("jlbnogfhkigoniojfngfcglhphldldgi") >= 0) {
          connection = mcgill;
        } else if (window.location.origin.indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
          connection = testing;
        } else if (window.location.origin.indexOf("ocmdknddgpmjngkhcbcofoogkommjfoj") >= 0) {
          connection = production;
        }
      }
      return connection;
    }
  },

  getCouchUrl: {
    value: function(couchConnection, couchdbcommand) {
      if (!couchConnection) {
        couchConnection = this.defaultCouchConnection();
        this.debug("Using the apps couchConnection", couchConnection);
      }

      var couchurl = couchConnection.protocol + couchConnection.domain;
      if (couchConnection.port && couchConnection.port !== "443" && couchConnection.port !== "80") {
        couchurl = couchurl + ":" + couchConnection.port;
      }
      if (!couchConnection.path) {
        couchConnection.path = "";
      }
      couchurl = couchurl + couchConnection.path;
      if (couchdbcommand === null || couchdbcommand === undefined) {
        couchurl = couchurl + "/" + couchConnection.pouchname;
      } else {
        couchurl = couchurl + couchdbcommand;
      }


      /* Switch user to the new dev servers if they have the old ones */
      couchurl = couchurl.replace(/ifielddevs.iriscouch.com/g, "corpus.lingsync.org");
      couchurl = couchurl.replace(/corpusdev.lingsync.org/g, "corpus.lingsync.org");

      /*
       * For debugging cors #838: Switch to use the corsproxy corpus service instead
       * of couchdb directly
       */
      // couchurl = couchurl.replace(/https/g,"http").replace(/6984/g,"3186");

      return couchurl;
    }
  },

  login: {
    value: function(loginDetails) {
      var deferred = Q.defer(),
        self = this,
        baseUrl = this.url,
        authUrl = this.authUrl;

      if (!baseUrl) {
        baseUrl = this.BASE_DB_URL;
      }

      if (!authUrl) {
        authUrl = this.BASE_AUTH_URL;
      }

      CORS.makeCORSRequest({
        type: "POST",
        dataType: "json",
        url: authUrl + "/login",
        data: loginDetails
      }).then(function(authserverResult) {
          if (authserverResult.user) {
            var corpusServerURLs = [];
            if (authserverResult.user.corpuses && authserverResult.user.corpuses[0]) {
              authserverResult.user.corpuses.map(function(corpusConnection) {
                var url = self.getCouchUrl(corpusConnection, "/_session");
                if (!self.dbname && corpusServerURLs.indexOf(url) === -1) {
                  corpusServerURLs.push(url);
                } else if (self.dbname && corpusConnection.pouchname === self.dbname && corpusServerURLs.indexOf(url) === -1) {
                  corpusServerURLs.push(url);
                }
              });
            }
            if (corpusServerURLs.length < 1) {
              corpusServerURLs = [baseUrl + "/_session"];
            }
            var promises = [];
            authserverResult.user.roles = [];
            for (var corpusUrlIndex = 0; corpusUrlIndex < corpusServerURLs.length; corpusUrlIndex++) {
              promises.push(CORS.makeCORSRequest({
                type: "POST",
                dataType: "json",
                url: corpusServerURLs[corpusUrlIndex],
                data: {
                  name: authserverResult.user.username,
                  password: loginDetails.password
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
          self.debug(reason);
          deferred.reject(reason);
        }).fail(function(reason) {
        self.debug(reason);
        deferred.reject(reason);
      });
      return deferred.promise;
    }
  },

  logout: {
    value: function() {
      var deferred = Q.defer(),
        baseUrl = this.url,
        self = this;

      if (!baseUrl) {
        baseUrl = this.BASE_DB_URL;
      }

      CORS.makeCORSRequest({
        type: "DELETE",
        dataType: "json",
        url: baseUrl + "/_session"
      }).then(function(result) {
          if (result.ok) {
            self.connectionInfo = null;
            deferred.resolve(result);
          } else {
            deferred.reject(result);
          }
        },
        function(reason) {
          this.debug(reason);
          deferred.reject(reason);

        });
      return deferred.promise;
    }
  },

  register: {
    value: function(registerDetails) {
      var deferred = Q.defer(),
        self = this,
        baseUrl = this.url,
        authUrl = this.authUrl;

      if (!baseUrl) {
        baseUrl = this.BASE_DB_URL;
      }

      if (!authUrl) {
        authUrl = this.BASE_AUTH_URL;
      }

      if (!registerDetails) {
        registerDetails = {
          username: this.dbname.split("-")[0],
          password: "testtest"
        };
      }

      CORS.makeCORSRequest({
        type: "POST",
        dataType: "json",
        url: authUrl + "/register",
        data: registerDetails
      }).then(function(result) {
          if (result.user) {
            CORS.makeCORSRequest({
              type: "POST",
              dataType: "json",
              url: baseUrl + "/_session",
              data: {
                name: result.user.username,
                password: registerDetails.password
              }
            }).then(function(session) {
              self.debug(session);
              deferred.resolve(result.user);
            }, function() {
              self.debug("Failed to login ");
              deferred.reject();
            });
          } else {
            deferred.reject();
          }
        },
        function(reason) {
          self.debug(reason);
          deferred.reject(reason);
        }).fail(function(reason) {
        self.debug(reason);
        deferred.reject(reason);
      });
      return deferred.promise;
    }
  }
});

exports.Database = Database;
