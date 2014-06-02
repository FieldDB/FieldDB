(function(exports) {

  var Q = require('q');
  var CORS = require('fielddb/api/CORS').CORS;
  var FieldDBObject = require('fielddb/api/FieldDBObject').FieldDBObject;

  var Database = function Database(options) {
    // console.log("In Database ", options);
    FieldDBObject.apply(this, arguments);
  };

  var DEFAULTALLDOCUMENTSMAPREDUCE = '_design/pages/_view/datums?descending=true&limit=10';
  Database.prototype = Object.create(FieldDBObject.prototype, /** @lends Database.prototype */ {
    constructor: {
      value: Database
    },
    allDocumentsMapReduce: {
      get: function() {
        if (!this._allDocumentsMapReduce) {
          // this._allDocumentsMapReduce = "";
          return DEFAULTALLDOCUMENTSMAPREDUCE;
        }
        return this._allDocumentsMapReduce;
      },
      set: function(value) {
        if (value === this._allDocumentsMapReduce) {
          return;
        }
        if (!value) {
          value = "";
        }
        this._allDocumentsMapReduce = value.trim();
      }
    },
    fetchAllDocuments: {
      value: function() {
        var deffered = Q.defer(),
          self = this;

        if (!this.url) {
          console.warn("Cannot fetch data with out a url");
          return;
        }

        var cantLogIn = function(reason) {
          console.log(reason);
          self.register().then(function() {
            self.fetchAllDocuments().then(function(documents) {
              deffered.resolve(documents);
            }, function(reason) {
              deffered.reject(reason);
            });
          });
        };

        CORS.makeCORSRequest({
          type: 'POST',
          dataType: "json",
          url: self.url + "/_session",
          data: {
            name: self.dbname.split("-")[0],
            password: 'testtest'
          }
        }).then(function(session) {


          CORS.makeCORSRequest({
            type: 'GET',
            dataType: "json",
            url: self.url + "/" + self.dbname + "/" + self.allDocumentsMapReduce
          }).then(function(result) {
            if (result.rows && result.rows.length) {
              deffered.resolve(result.rows.map(function(doc) {
                return doc.value;
              }));
            } else {
              deffered.resolve([]);
            }
          }, cantLogIn);


        }, cantLogIn);
        return deffered.promise;
      }
    },
    register: {
      value: function() {
        var deffered = Q.defer(),
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
                deffered.resolve(result.user);
              }, function() {
                console.log("Failed to login ");
                deffered.reject();
              });
            } else {
              deffered.reject();
            }
          },
          function(reason) {
            console.log(reason);
            deffered.reject(reason);
          }).fail(function(reason) {
          console.log(reason);
          deffered.reject(reason);
        });
        return deffered.promise;
      }
    }
  });

  console.log(Database);
  exports.Database = Database;

})(typeof exports === 'undefined' ? this['Database'] = {} : exports);
