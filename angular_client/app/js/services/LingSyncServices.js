console.log("Loading the LingSyncServices.");

'use strict';
define([ "angular" ], function(angular) {
  var LingSyncServices = angular.module('LingSync.services', [ 'ngResource' ])
      .factory(
          'LingSyncData',
          function($http) {
            return {
              'async' : function(DB, UUID) {
                var couchInfo;
                if (UUID != undefined) {
                  couchInfo = "https://senhorzinho.iriscouch.com/" + DB
                  + "/" + UUID;
                  console.log("Contacting the DB to get LingSync data "
                      + couchInfo);
                  var promise = $http.get(couchInfo).then(function(response) {
                    console.log("Receiving LingSync data results ");
                    return response.data;
                  });
                  return promise;
                } else {
                  couchInfo = "https://senhorzinho.iriscouch.com/" + DB
                  + "/_design/data/_view/all_data";
                  console.log("Contacting the DB to get LingSync data "
                      + couchInfo);
                  var promise = $http.get(couchInfo).then(function(response) {
                    console.log("Receiving LingSync data results ");
                    return response.data.rows;
                  });
                  return promise;
                }
                
                
              },
              'saveNew' : function(DB, newRecord) {
                var couchInfo = "https://senhorzinho.iriscouch.com/" + DB;
                console.log("Contacting the DB to save new record. "
                    + couchInfo);
                var promise = $http.post(couchInfo, newRecord).then(function(response) {
                  return response;
                });
                return promise;
              },
              'saveEditedRecord' : function(DB, UUID, newRecord) {
                var couchInfo = "https://senhorzinho.iriscouch.com/" + DB + "/" + UUID;
                console.log("Contacting the DB to save edited record. "
                    + couchInfo);
                var promise = $http.put(couchInfo, newRecord).then(function(response) {
                  return response;
                });
                return promise;
              },
              'blankTemplate' : function() {
                var promise = $http.get('data/blank_template.json').then(function(response) {
                  return response.data;
                });
                return promise;
              },
              'getDatumFields' : function() {
                var promise = $http.get('https://senhorzinho.iriscouch.com/lingsync1/_design/get_datum_fields/_view/get_datum_fields?group=true').then(function(response) {
                  return response.data.rows;
                });
                return promise;
              }
            };
          });
  return LingSyncServices;
});