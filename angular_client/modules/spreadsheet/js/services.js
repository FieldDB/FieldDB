console.log("Loading the SpreadsheetStyleDataEntryServices.");

define(
  ["angular", "js/SpreadsheetDatum"],
  function(angular, SpreadsheetDatum) {

    'use strict';

    var SpreadsheetStyleDataEntryServices = angular
      .module('spreadsheet_services', ['ngResource'])
      .factory(
        'Data',
        function($http, $rootScope, $q, Servers, md5) {

          var getDocFromCouchDB = function (DB, UUID) {
            if (!$rootScope.serverCode) {
              console.log("Sever code is undefined");
              window.location.assign("#/corpora_list");
              return;
            }
            var promise;

            if (UUID != undefined) {
              var config = {
                method: "GET",
                url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/" + UUID,
                withCredentials: true
              };

              console.log("Contacting the DB to get   record data " + config.url);
              promise = $http(config).then(function(response) {
                console.log("Receiving data results ");
                return response.data;
              });
              return promise;
            } else {
              config = {
                method: "GET",
                url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_view/datums_chronological",
                withCredentials: true
              };
              console.log("Contacting the DB to get all corpus data for " + DB);
              promise = $http(config).then(function(response) {
                console.log("Receiving data results ");
                return response.data.rows;
              });
              return promise;
            }
          };

          var saveCouchDoc = function(DB, newRecord) {
            if (!$rootScope.serverCode) {
              console.log("Sever code is undefined");
              window.location.assign("#/corpora_list");
              return;
            }
            var config = {
              method: "POST",
              url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB,
              data: newRecord,
              withCredentials: true
            };

            if (newRecord._rev) {
              config.method = "PUT";
              config.url = config.url + "/" + newRecord._id + "?rev=" + newRecord._rev
            }

            console.log("Contacting the DB to save record. " + config.url);
            var promise = $http(config).then(function(response) {
              return response;
            });
            return promise;
          };

          var getBlankDatumTemplate = function() {
            var promise = $http.get('data/blank_datum_template.json').then(
              function(response) {
                /* Override default datum fields with the ones in the currently loaded corpus */
                if ($rootScope.DB && $rootScope.DB.datumFields) {
                  response.data.datumFields = $rootScope.DB.datumFields;
                }
                return response.data;
              });
            return promise;
          };

          return {
            'async': getDocFromCouchDB,
            'datumFields': function(DB) {
              if (!$rootScope.serverCode) {
                console.log("Sever code is undefined");
                window.location.assign("#/corpora_list");
                return;
              }
              var config = {
                method: "GET",
                url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_view/get_datum_fields",
                withCredentials: true
              };

              console.log("Contacting the DB to get   datum fields for " + config.url);
              var promise = $http(config).then(function(response) {
                console.log("Receiving   datum fields ");
                return response.data.rows;
              });
              return promise;
            },
            'sessions': function(DB) {
              if (!$rootScope.serverCode) {
                console.log("Sever code is undefined");
                window.location.assign("#/corpora_list");
                return;
              }
              var config = {
                method: "GET",
                url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_view/sessions",
                withCredentials: true
              };

              console.log("Contacting the DB to get sessions for " + config.url);
              var promise = $http(config).then(function(response) {
                console.log("Receiving datum fields ");
                return response.data.rows;
              });
              return promise;
            },
            'glosser': function(DB) {
              if (!$rootScope.serverCode) {
                console.log("Sever code is undefined");
                window.location.assign("#/corpora_list");
                return;
              }
              var config = {
                method: "GET",
                url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_view/precedence_rules?group=true",
                withCredentials: true
              };

              console
                .log("Contacting the DB to get glosser precedence rules for " + config.url);
              var promise = $http(config).then(function(response) {
                console.log("Receiving precedence rules ");
                return response.data.rows;
              });
              return promise;
            },
            'lexicon': function(DB) {
              if (!$rootScope.serverCode) {
                console.log("Sever code is undefined");
                window.location.assign("#/corpora_list");
                return;
              }
              var config = {
                method: "GET",
                url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_view/lexicon_create_tuples?group=true",
                withCredentials: true
              };

              console.log("Contacting the DB to get lexicon for " + config.url);
              var promise = $http(config).then(function(response) {
                console.log("Receiving lexicon ");
                return response.data.rows;
              });
              return promise;
            },
            'getallusers': function(loginInfo) {
              if (!$rootScope.serverCode) {
                console.log("Sever code is undefined");
                window.location.assign("#/corpora_list");
                return;
              }
              var config = {
                method: "POST",
                url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/corpusteam",
                data: loginInfo,
                withCredentials: true
              };

              console.log("Contacting the DB to get all users for " + config.url);
              var promise = $http(config).then(function(response) {
                console.log("Receiving all users");
                return response.data.users;
              });
              return promise;
            },
            'login': function(user, password) {
              if (!$rootScope.serverCode) {
                console.log("Sever code is undefined");
                window.location.assign("#/corpora_list");
                return;
              }
              var deferred = $q.defer();

              var authConfig = {
                method: "POST",
                url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/login",
                data: {
                  username: user,
                  password: password
                },
                withCredentials: true
              };
              var corpusConfig = {
                method: "POST",
                url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/_session",
                data: {
                  name: user,
                  password: password
                },
                withCredentials: true
              };

              var userIsAuthenticated = function(user){
                user.name = user.firstname || user.lastname || user.username;
                if (!user.gravatar || user.gravatar.indexOf("gravatar") > -1) {
                  user.gravatar = md5.createHash(user.email);
                }
                $rootScope.user = user;
                var promiseCorpus = $http(corpusConfig).then(
                  function(corpusResponse) {
                    console.log("Logging in to corpus server.");
                    deferred.resolve(corpusResponse);
                  },
                  function(err) {
                    deferred.reject("Please report this.");
                  });
              }

              var promise = $http(authConfig).then(
                function(response) {
                  if(response.data.userFriendlyErrors){
                    deferred.reject(response.data.userFriendlyErrors.join(" "));
                  } else {
                    userIsAuthenticated(response.data.user);
                  }

                }, 
                function(err) {
                  console.log(err);
                  var message = "please report this.";
                  if(err.status == 0){
                    message = "are you offline?";
                    if($rootScope.serverCode == "mcgill"|| $rootScope.serverCode == "concordia"){
                      message = "have you accepted the server's security certificate? (please refer to your registration email)";
                    }
                  }

                  deferred.reject("Cannot contact "+$rootScope.serverCode+" server, " + message);
                });
              return deferred.promise;
            },
            'register': function(newLoginInfo) {



              var config = {
                method: "POST",
                url: newLoginInfo.authUrl + "/register",
                data: newLoginInfo,
                withCredentials : true
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
                  $rootScope.notificationMessage = "Error registering a new user, please contact us. Opening the Contact Us page... ";
                  $rootScope.openNotification();
                  $rootScope.loading = false;
                  window.setTimeout(function(){
                    window.open("https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform");
                  }, 1500)
                  
                });
              return promise;
            },
            'createcorpus': function(newCorpusInfo) {
              if (!$rootScope.serverCode) {
                console.log("Sever code is undefined");
                window.location.assign("#/corpora_list");
                return;
              }
              var config = {
                method: "POST",
                url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/newcorpus",
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
              if (!$rootScope.serverCode) {
                console.log("Sever code is undefined");
                window.location.assign("#/corpora_list");
                return;
              }
              var config = {
                method: "POST",
                url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/updateroles",
                data: newRoleInfo,
                withCredentials: true
              };

              var promise = $http(config)
                .then(
                  function(response) {
                    console.log("Updated user roles.");
                    if (response.data.userFriendlyErrors) {
                      if (response.data.userFriendlyErrors[0] === null) {
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
            'saveCouchDoc': saveCouchDoc,
            'saveSpreadsheetDatum': function(spreadsheetDatumToBeSaved) {
              var deffered = Q.defer();

              Q.nextTick(function() {
                // spreadsheetDatumToBeSaved.timestamp = Date.now();
                // spreadsheetDatumToBeSaved.dateModified = JSON.parse(JSON.stringify(new Date())); //These were done in the edit functions because the data might get saved an hour after it was modified... or more...
                var convertAndSaveAsFieldDBDatum = function(fieldDBDatumDocOrTemplate) {
                  try {
                    var fieldDBDatum = SpreadsheetDatum.convertSpreadSheetDatumIntoFieldDBDatum(spreadsheetDatumToBeSaved, fieldDBDatumDocOrTemplate);
                  } catch (e) {
                    deffered.reject("Error saving datum: " + JSON.stringify(e));
                    return;
                  }
                  saveCouchDoc(fieldDBDatum.pouchname, fieldDBDatum).then(function(response) {
                    console.log(response);
                    if (response.status >= 400) {
                      deffered.reject("Error saving datum " + response.status);
                      return;
                    }
                    if (!spreadsheetDatumToBeSaved.id) {
                      spreadsheetDatumToBeSaved.id = response.data.id;
                      spreadsheetDatumToBeSaved.rev = response.data.rev;
                    }
                    deffered.resolve(spreadsheetDatumToBeSaved);
                  }, function(e) {
                    var reason = "Error saving datum. Maybe you're offline?";
                    if (e.data && e.data.reason) {
                      reason = e.data.reason;
                    } else if (e.status) {
                      reason = "Error saving datum: " + e.status;
                    }
                    console.log(reason, fieldDBDatum, e);
                    deffered.reject(reason);
                  });
                };

                if (spreadsheetDatumToBeSaved.id) {
                  getDocFromCouchDB(spreadsheetDatumToBeSaved.pouchname, spreadsheetDatumToBeSaved.id).then(convertAndSaveAsFieldDBDatum, function(e) {
                    var reason = "Error getting the most recent version of the datum. Maybe you're offline?";
                    if (e.data && e.data.reason) {
                      if (e.data.reason == "missing") {
                        e.data.reason = e.data.reason + " Please report this.";
                      }
                      reason = e.data.reason;
                    } else if (e.status) {
                      reason = "Error getting the most recent version of the datum: " + e.status;
                    }
                    console.log(reason, spreadsheetDatumToBeSaved, e);
                    deffered.reject(reason);
                  });
                } else {
                  getBlankDatumTemplate().then(convertAndSaveAsFieldDBDatum);
                }

              });
              return deffered.promise;
            },
            'blankDatumTemplate': getBlankDatumTemplate,
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
              if (!$rootScope.serverCode) {
                console.log("Sever code is undefined");
                window.location.assign("#/corpora_list");
                return;
              }
              console.log("You cannot delete items from the corpus.");
              return;
              var config = {
                method: "DELETE",
                url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/" + UUID + "?rev=" + rev,
                withCredentials: true
              };

              console.log("Contacting the DB to delete record. " + config.url);
              var promise = $http(config).then(function(response) {
                return response;
              });
              return promise;
            },
            'changePassword': function(changePasswordInfo) {
              if (!$rootScope.serverCode) {
                console.log("Sever code is undefined");
                window.location.assign("#/corpora_list");
                return;
              }
              var config = {
                method: "POST",
                data: changePasswordInfo,
                url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/changepassword",
                withCredentials: true
              };

              console.log("Contacting the server to change password. " + config.url);
              var promise = $http(config).then(function(response) {
                return response;
              });
              return promise;
            }
          };
        });
    return SpreadsheetStyleDataEntryServices;
  });
