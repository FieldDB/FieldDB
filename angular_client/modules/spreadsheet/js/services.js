console.log("Loading the SpreadsheetStyleDataEntryServices.");

'use strict';
define(
    [ "angular" ],
    function(angular) {
      var SpreadsheetStyleDataEntryServices = angular
          .module('SpreadsheetStyleDataEntry.services', [ 'ngResource' ])
          .factory(
              'Data',
              function($http, $rootScope) {
                return {
                  'async' : function(DB, UUID) {
                    var couchInfo;
                    if (UUID != undefined) {
                      couchInfo = $rootScope.server + DB + "/" + UUID;
                      var config = {
                        method : "GET",
                        url : couchInfo,
                        withCredentials : true
                      };

                      console
                          .log("Contacting the DB to get   record data "
                              + couchInfo);
                      var promise = $http(config).then(function(response) {
                        console.log("Receiving   data results ");
                        return response.data;
                      });
                      return promise;
                    } else {

                      var couchInfo = $rootScope.server + DB
                          + "/_design/pages/_view/datums"

                      var config = {
                        method : "GET",
                        url : couchInfo,
                        withCredentials : true
                      };
                      console
                          .log("Contacting the DB to get all   corpus data for "
                              + DB);
                      var promise = $http(config).then(function(response) {
                        console.log("Receiving   data results ");
                        return response.data.rows;
                      });
                      return promise;
                    }
                  },
                  'datumFields' : function(DB) {
                    var couchInfo = $rootScope.server + DB
                        + "/_design/pages/_view/get_datum_fields";

                    var config = {
                      method : "GET",
                      url : couchInfo,
                      withCredentials : true
                    };

                    console
                        .log("Contacting the DB to get   datum fields for "
                            + couchInfo);
                    var promise = $http(config).then(function(response) {
                      console.log("Receiving   datum fields ");
                      return response.data.rows;
                    });
                    return promise;
                  },
                  'login' : function(user, password) {

                    var userInfo = {
                      name : user,
                      password : password
                    };

                    var couchInfo = $rootScope.server + "_session";

                    var config = {
                      method : "POST",
                      url : couchInfo,
                      data : userInfo,
                      withCredentials : true
                    };

                    var promise = $http(config)
                        .then(
                            function(response) {
                              console.log("Logging in/Keeping session alive.");
                              return response;
                            },
                            function() {
                              window
                                  .alert("Error logging in.\nPlease check username/password.");
                              $rootScope.loading = false;
                            });
                    return promise;
                  },
                  'saveNew' : function(DB, newRecord) {
                    var couchInfo = $rootScope.server + DB;

                    var config = {
                      method : "POST",
                      url : couchInfo,
                      data : newRecord,
                      withCredentials : true
                    };

                    console.log("Contacting the DB to save new record. "
                        + couchInfo);
                    var promise = $http(config).then(function(response) {
                      return response;
                    });
                    return promise;
                  },
                  'saveEditedRecord' : function(DB, UUID, newRecord, rev) {
                    var couchInfo;
                    if (rev) {
                      couchInfo = $rootScope.server + DB + "/" + UUID + "?rev="
                          + rev;
                    } else {
                      couchInfo = $rootScope.server + DB + "/" + UUID;
                    }

                    var config = {
                      method : "PUT",
                      url : couchInfo,
                      data : newRecord,
                      withCredentials : true
                    };

                    console.log("Contacting the DB to save edited record. "
                        + couchInfo);
                    var promise = $http(config).then(function(response) {
                      return response;
                    });
                    return promise;
                  },
                  'blankTemplate' : function() {
                    var promise = $http.get('data/blank_template.json').then(
                        function(response) {
                          return response.data;
                        });
                    return promise;
                  },
                  'blankSessionTemplate' : function() {
                    var promise = $http.get('data/blank_session_template.json')
                        .then(function(response) {
                          return response.data;
                        });
                    return promise;
                  },
                  'removeRecord' : function(DB, UUID, rev) {
                    var couchInfo = $rootScope.server + DB + "/" + UUID
                        + "?rev=" + rev;

                    var config = {
                      method : "DELETE",
                      url : couchInfo,
                      withCredentials : true
                    };

                    console.log("Contacting the DB to delete record. "
                        + couchInfo);
                    var promise = $http(config).then(function(response) {
                      return response;
                    });
                    return promise;
                  }
                };
              });
      return SpreadsheetStyleDataEntryServices;
    });