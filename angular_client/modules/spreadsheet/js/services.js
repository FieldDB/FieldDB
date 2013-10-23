console.log("Loading the SpreadsheetStyleDataEntryServices.");

'use strict';
define(
  ["angular"],
  function(angular) {
    var SpreadsheetStyleDataEntryServices = angular
      .module('SpreadsheetStyleDataEntry.services', ['ngResource'])
      .factory(
        'Data',
        function($http, $rootScope) {
          return {
            'async': function(DB, UUID) {
              var couchInfo;
              if (UUID != undefined) {
                couchInfo = $rootScope.server + DB + "/" + UUID;
                var config = {
                  method: "GET",
                  url: couchInfo,
                  withCredentials: true
                };

                console.log("Contacting the DB to get   record data " + couchInfo);
                var promise = $http(config).then(function(response) {
                  console.log("Receiving   data results ");
                  return response.data;
                });
                return promise;
              } else {

                var couchInfo = $rootScope.server + DB + "/_design/pages/_view/datums";

                var config = {
                  method: "GET",
                  url: couchInfo,
                  withCredentials: true
                };
                console
                  .log("Contacting the DB to get all   corpus data for " + DB);
                var promise = $http(config).then(function(response) {
                  console.log("Receiving   data results ");
                  return response.data.rows;
                });
                return promise;
              }
            },
            'datumFields': function(DB) {
              var couchInfo = $rootScope.server + DB + "/_design/pages/_view/get_datum_fields";

              var config = {
                method: "GET",
                url: couchInfo,
                withCredentials: true
              };

              console.log("Contacting the DB to get   datum fields for " + couchInfo);
              var promise = $http(config).then(function(response) {
                console.log("Receiving   datum fields ");
                return response.data.rows;
              });
              return promise;
            },
            'sessions': function(DB) {
              var couchInfo = $rootScope.server + DB + "/_design/pages/_view/sessions";

              var config = {
                method: "GET",
                url: couchInfo,
                withCredentials: true
              };

              console.log("Contacting the DB to get sessions for " + couchInfo);
              var promise = $http(config).then(function(response) {
                console.log("Receiving   datum fields ");
                return response.data.rows;
              });
              return promise;
            },
            'glosser': function(DB) {
              var couchInfo = $rootScope.server + DB + "/_design/pages/_view/precedence_rules?group=true";

              var config = {
                method: "GET",
                url: couchInfo,
                withCredentials: true
              };

              console
                .log("Contacting the DB to get glosser precedence rules for " + couchInfo);
              var promise = $http(config).then(function(response) {
                console.log("Receiving precedence rules ");
                return response.data.rows;
              });
              return promise;
            },
            'lexicon': function(DB) {
              var couchInfo = $rootScope.server + DB + "/_design/pages/_view/lexicon_create_tuples?group=true";

              var config = {
                method: "GET",
                url: couchInfo,
                withCredentials: true
              };

              console.log("Contacting the DB to get lexicon for " + couchInfo);
              var promise = $http(config).then(function(response) {
                console.log("Receiving lexicon ");
                return response.data.rows;
              });
              return promise;
            },
            'getallusers': function(userInfo) {
              var couchInfo = $rootScope.server + "zfielddbuserscouch/_all_docs";

              var config = {
                method: "POST",
                url: userInfo.authUrl + "/corpusteam",
                data: userInfo,
                withCredentials: true
              };

              console.log("Contacting the DB to get all users for " + couchInfo);
              var promise = $http(config).then(function(response) {
                console.log("Receiving all users");
                return response.data.users;
              });
              return promise;
            },
            'login': function(user, password) {

              var userInfo = {
                name: user,
                password: password
              };

              var couchInfo = $rootScope.server + "_session";

              var config = {
                method: "POST",
                url: couchInfo,
                data: userInfo,
                withCredentials: true
              };

              var promise = $http(config)
                .then(
                  function(response) {
                    console.log("Logging in/Keeping session alive.");
                    return response;
                  },
                  function(err) {
                    $rootScope.notificationMessage = "Error logging in.\nPlease check username/password.";
                    $rootScope.openNotification();
                    console.log(err);
                    $rootScope.loading = false;
                  });
              return promise;
            },
            'register': function(newUserInfo) {
              var config = {
                method: "POST",
                url: newUserInfo.authUrl + "/register",
                data: newUserInfo
                // withCredentials : true
              };

              var promise = $http(config).then(
                function(response) {
                  console.log("Registered new user.");
                  if (response.data.userFriendlyErrors) {
                    $rootScope.notificationMessage = response.data.userFriendlyErrors[0];
                    $rootScope.openNotification();
                  } else {
                    $rootScope.notificationMessage = "Successfully registered new user: " + response.data.user.username + "\nYou may now log in on the main page.";
                    $rootScope.openNotification();
                    window.location.assign("#/");
                  }
                  return response;
                }, function(err) {
                  console.log(JSON.stringify(err));
                  $rootScope.notificationMessage = "Error registering new user.";
                  $rootScope.openNotification();
                  $rootScope.loading = false;
                });
              return promise;
            },
            'createcorpus': function(newCorpusInfo) {
              var config = {
                method: "POST",
                url: newCorpusInfo.authUrl + "/newcorpus",
                data: newCorpusInfo,
                withCredentials: true
              };

              var promise = $http(config)
                .then(
                  function(response) {
                    console.log("Created new corpus.");
                    console.log(JSON.stringify(response));
                    if (response.data.userFriendlyErrors) {
                      $rootScope.notificationMessage = response.data.userFriendlyErrors[0];
                      $rootScope.openNotification();
                    } else {
                      $rootScope.notificationMessage = JSON.stringify(response.data.info[0]) + "\nYou may now log in to this corpus.";
                      $rootScope.openNotification();
                    }
                    return response.data;
                  }, function(err) {
                    console.log(JSON.stringify(err));
                    $rootScope.notificationMessage = "Error creating new corpus.";
                    $rootScope.openNotification();
                    $rootScope.loading = false;
                  });
              return promise;
            },
            'updateroles': function(newRoleInfo) {
              var config = {
                method: "POST",
                url: newRoleInfo.authUrl + "/updateroles",
                data: newRoleInfo,
                withCredentials: true
              };

              var promise = $http(config)
                .then(
                  function(response) {
                    console.log("Updated user roles.");
                    if (response.data.userFriendlyErrors) {
                      if (response.data.userFriendlyErrors[0] == null) {
                        $rootScope.notificationMessage = "Error adding user. Please make sure that user exists.";
                        $rootScope.openNotification();
                      } else {
                        $rootScope.notificationMessage = response.data.userFriendlyErrors[0];
                        $rootScope.openNotification();
                      }
                    } else {
                      $rootScope.notificationMessage = JSON.stringify(response.data.info[0]);
                      $rootScope.openNotification();
                    }
                    return response;
                  },
                  function(err) {
                    console.log(JSON.stringify(err));
                    $rootScope.notificationMessage = "Error updating user roles.";
                    $rootScope.openNotification();
                    $rootScope.loading = false;
                  });
              return promise;
            },
            'saveNew': function(DB, newRecord) {
              var couchInfo = $rootScope.server + DB;

              var config = {
                method: "POST",
                url: couchInfo,
                data: newRecord,
                withCredentials: true
              };

              console.log("Contacting the DB to save new record. " + couchInfo);
              var promise = $http(config).then(function(response) {
                return response;
              });
              return promise;
            },
            'saveEditedRecord': function(DB, UUID, newRecord, rev) {
              var couchInfo;
              if (rev) {
                couchInfo = $rootScope.server + DB + "/" + UUID + "?rev=" + rev;
              } else {
                couchInfo = $rootScope.server + DB + "/" + UUID;
              }

              var config = {
                method: "PUT",
                url: couchInfo,
                data: newRecord,
                withCredentials: true
              };

              console.log("Contacting the DB to save edited record. " + couchInfo);
              var promise = $http(config).then(function(response) {
                return response;
              });
              return promise;
            },
            'blankDatumTemplate': function() {
              var promise = $http.get('data/blank_datum_template.json').then(
                function(response) {
                  return response.data;
                });
              return promise;
            },
            'blankSessionTemplate': function() {
              var promise = $http.get('data/blank_session_template.json')
                .then(function(response) {
                  return response.data;
                });
              return promise;
            },
            'blankActivityTemplate': function() {
              var promise = $http
                .get('data/blank_activity_template.json').then(
                  function(response) {
                    return response.data;
                  });
              return promise;
            },
            'removeRecord': function(DB, UUID, rev) {
              var couchInfo = $rootScope.server + DB + "/" + UUID + "?rev=" + rev;

              var config = {
                method: "DELETE",
                url: couchInfo,
                withCredentials: true
              };

              console.log("Contacting the DB to delete record. " + couchInfo);
              var promise = $http(config).then(function(response) {
                return response;
              });
              return promise;
            }
          };
        });
    return SpreadsheetStyleDataEntryServices;
  });