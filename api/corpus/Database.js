var Q = require('q');
var CORS = require('../CORS').CORS;
var FieldDBObject = require('../FieldDBObject').FieldDBObject;

var Database = function Database(options) {
  this.debug("In Database ", options);
  FieldDBObject.apply(this, arguments);
};

var DEFAULT_COLLECTION_MAPREDUCE = '_design/pages/_view/COLLECTION?descending=true';
var DEFAULT_BASE_AUTH_URL = "https://localhost:3181";
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

  fetchAllDocuments: {
    value: function() {
      return this.fetchCollection("datums");
    }
  },

  fetchCollection: {
    value: function(collectionType, start, end, limit, reduce) {
      this.todo('Provide pagination ', start, end, limit, reduce);
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
      //   type: 'POST',
      //   dataType: "json",
      //   url: self.url + "/_session",
      //   data: {
      //     name: self.dbname.split("-")[0],
      //     password: 'testtest'
      //   }
      // }).then(function(session) {

      if (Object.prototype.toString.call(collectionType) === '[object Array]') {
        var promises = [];
        collectionType.map(function(id) {
          promises.push(CORS.makeCORSRequest({
            type: 'GET',
            dataType: "json",
            url: baseUrl + "/" + self.dbname + "/" + id
          }));
        });

        Q.allSettled(promises).then(function(results) {
          console.log(results);
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
          type: 'GET',
          dataType: "json",
          url: baseUrl + "/" + self.dbname + "/" + self.DEFAULT_COLLECTION_MAPREDUCE.replace("COLLECTION", collectionType)
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
        baseUrl = this.url;

      if (!baseUrl) {
        baseUrl = this.BASE_DB_URL;
      }

      CORS.makeCORSRequest({
        type: 'GET',
        dataType: 'json',
        url: baseUrl + '/_session'
      }).then(function(sessionInfo) {
        console.log(sessionInfo);
        deferred.resolve(sessionInfo);
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
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
        type: 'POST',
        dataType: "json",
        url: authUrl + "/login",
        data: loginDetails
      }).then(function(result) {
          if (result.user) {
            CORS.makeCORSRequest({
              type: 'POST',
              dataType: "json",
              url: baseUrl + "/_session",
              data: {
                name: result.user.username,
                password: loginDetails.password
              }
            }).then(function(sessionInfo) {
              // self.debug(sessionInfo);
              result.user.roles = sessionInfo.roles;
              deferred.resolve(result.user);
            }, function() {
              self.debug("Failed to login ");
              deferred.reject("Something is wrong.");
            });
          } else {
            deferred.reject(result.userFriendlyErrors.join(" "));
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
        baseUrl = this.url;

      if (!baseUrl) {
        baseUrl = this.BASE_DB_URL;
      }

      CORS.makeCORSRequest({
        type: 'DELETE',
        dataType: "json",
        url: baseUrl + "/_session"
      }).then(function(result) {
          if (result.ok) {
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
    value: function() {
      var deferred = Q.defer(),
        self = this,
        baseUrl = this.url;

      if (!baseUrl) {
        baseUrl = this.BASE_DB_URL;
      }

      CORS.makeCORSRequest({
        type: 'POST',
        dataType: "json",
        url: "https://localhost:3183/register",
        data: {
          username: this.dbname.split("-")[0],
          password: 'testtest'
        }
      }).then(function(result) {
          if (result.user) {
            CORS.makeCORSRequest({
              type: 'POST',
              dataType: "json",
              url: baseUrl + "/_session",
              data: {
                name: result.user.username,
                password: 'testtest'
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
