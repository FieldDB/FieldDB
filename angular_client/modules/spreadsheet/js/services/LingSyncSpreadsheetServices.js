console.log("Loading the LingSyncSpreadsheetServices.");

'use strict';
define([ "angular" ], function(angular) {
  var LingSyncSpreadsheetServices = angular.module('LingSyncSpreadsheet.services', [ 'ngResource' ])
      .factory(
          'LingSyncData',
          function($http) {
            return {
              'async' : function(DB, UUID) {
                var couchInfo;
                if (UUID != undefined) {
                  couchInfo = "https://ifielddevs.iriscouch.com/" + DB
                  + "/" + UUID;
                  console.log("Contacting the DB to get LingSync record data "
                      + couchInfo);
                  var promise = $http.get(couchInfo).then(function(response) {
                    console.log("Receiving LingSync data results ");
                    return response.data;
                  });
                  return promise;
                } else {
                  couchInfo = "https://ifielddevs.iriscouch.com/" + DB
                  + "/_design/get_datum_field/_view/get_datum_fields";
                  console.log("Contacting the DB to get all LingSync corpus data for " + DB + " " 
                      + couchInfo);
                  var promise = $http.get(couchInfo).then(function(response) {
                    console.log("Receiving LingSync data results ");
                    return response.data.rows;
                  });
                  return promise;
                }
                
                
              },
              'login' : function(user, password) {
                var couchInfo = "https://ifielddevs.iriscouch.com/_session";
                var userInfo = {
                    "name" : user,
                    "password" : password
                };
                var promise = $http.post(couchInfo, userInfo).then(function(response) {
                  return response;
                });
                return promise;
              },
              'saveNew' : function(DB, newRecord) {
                var couchInfo = "https://ifielddevs.iriscouch.com/" + DB;
                console.log("Contacting the DB to save new record. "
                    + couchInfo);
                var promise = $http.post(couchInfo, newRecord).then(function(response) {
                  return response;
                });
                return promise;
              },
              'saveEditedRecord' : function(DB, UUID, newRecord) {
                var couchInfo = "https://ifielddevs.iriscouch.com/" + DB + "/" + UUID;
                console.log("Contacting the DB to save edited record. "
                    + couchInfo);
                var promise = $http.put(couchInfo, newRecord).then(function(response) {
                  return response;
                });
                return promise;
              },
              'removeRecord' : function(DB, UUID, rev) {
                  var couchInfo = "https://ifielddevs.iriscouch.com/" + DB + "/" + UUID + "?rev=" + rev;
                  console.log("Contacting the DB to delete record. "
                      + couchInfo);
                  var promise = $http.delete(couchInfo).then(function(response) {
                    return response;
                    console.loge("response: " + JSON.stringify(response));
                  });
                  return promise;
                },
              'blankTemplate' : function() {
                var promise = $http.get('data/blank_template.json').then(function(response) {
                  return response.data;
                });
                return promise;
              }
            };
          });
  return LingSyncSpreadsheetServices;
});