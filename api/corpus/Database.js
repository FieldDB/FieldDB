(function(exports) {

  var Q = require('q');
  var CORS = require('../CORS').CORS;
  var FieldDBObject = require('../FieldDBObject').FieldDBObject;

  var Database = function Database(options) {
    console.log("In Database ", options);
    FieldDBObject.apply(this, arguments);
  };

  var DEFAULT_COLLECTION_MAPREDUCE = '_design/pages/_view/COLLECTION?descending=true';

  Database.prototype = Object.create(FieldDBObject.prototype, /** @lends Database.prototype */ {
    constructor: {
      value: Database
    },

    DEFAULT_COLLECTION_MAPREDUCE: {
      value: DEFAULT_COLLECTION_MAPREDUCE
    },

    fetchAllDocuments: {
      value: function() {
        return this.fetchCollection("datums");
      }
    },

    fetchCollection: {
      value: function(collectionType) {
        var deferred = Q.defer(),
          self = this;

        if (!this.url) {
          console.warn("Cannot fetch data with out a url");
          return;
        }

        if (!collectionType) {
          console.warn("Cannot fetch data with out a collectionType (eg consultants, sessions, datalists)");
          return;
        }

        var cantLogIn = function(reason) {
          console.log(reason);
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


          CORS.makeCORSRequest({
            type: 'GET',
            dataType: "json",
            url: self.url + "/" + self.dbname + "/" + self.DEFAULT_COLLECTION_MAPREDUCE.replace("COLLECTION", collectionType)
          }).then(function(result) {
            if (result.rows && result.rows.length) {
              deferred.resolve(result.rows.map(function(doc) {
                return doc.value;
              }));
            } else {
              deferred.resolve([]);
            }
          }, cantLogIn);


        // }, cantLogIn);
        return deferred.promise;
      }
    },

    register: {
      value: function() {
        var deferred = Q.defer(),
          self = this;

        if (!this.url) {
          console.warn("Cannot fetch data with out a url");
          return;
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
                url: self.url + "/_session",
                data: {
                  name: result.user.username,
                  password: 'testtest'
                }
              }).then(function(session) {
                console.log(session);
                deferred.resolve(result.user);
              }, function() {
                console.log("Failed to login ");
                deferred.reject();
              });
            } else {
              deferred.reject();
            }
          },
          function(reason) {
            console.log(reason);
            deferred.reject(reason);
          }).fail(function(reason) {
          console.log(reason);
          deferred.reject(reason);
        });
        return deferred.promise;
      }
    }
  });

  console.log(Database);
  exports.Database = Database;

})(typeof exports === 'undefined' ? this['Database'] = {} : exports);
