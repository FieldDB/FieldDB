/* globals  Q, sjcl, SpreadsheetDatum */
'use strict';
console.log("Declaring the SpreadsheetStyleDataEntryServices.");

angular.module('spreadsheetApp')
  .factory('Data', function($http, $rootScope, $q, Servers) {

    var getDocFromCouchDB = function(DB, UUID) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var promise,
        config;

      if (UUID !== undefined) {
        config = {
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

    // var getDataBySession = function(DB, sessionID, guessedAudioUrl, $scope) {
    //   if (!sessionID) {

    //     return this.getDocFromCouchDB(DB, sessionID);
    //   }

    //   if (!$rootScope.serverCode) {
    //     console.log("Sever code is undefined");
    //     window.location.assign("#/corpora_list");
    //     return;
    //   }
    //   var deferred = $q.defer();

    //     config;

    //   config = {
    //     method: "GET",
    //     url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_list/as_data_list/list_of_data_by_session?key=%22sessionIDYouWantToSee%22".replace("sessionIDYouWantToSee", sessionID),
    //     withCredentials: true
    //   };
    //   console.log("Contacting the DB to get all corpus data for " + DB);
    //   promise = $http(config).then(function(response) {
    //     console.log("Receiving data results ");
    //     var arrayOfEventualData = [];
    //     var expectedCount = response.data.datumIds.length;
    //     response.data.datumIds.map(function(UUID) {
    //       config = {
    //         method: "GET",
    //         url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/" + UUID,
    //         withCredentials: true
    //       };

    //       console.log("Contacting the DB to get data " + config.url);
    //       promise = $http(config).then(function(response) {
    //         console.log("Receiving data results ");

    //         // Load data from current session into scope
    //         if (response.data.session._id === sessionID) {
    //           var newDatumFromServer = SpreadsheetDatum.convertFieldDBDatumIntoSpreadSheetDatum({},
    //             response.data,
    //             $rootScope.server + "/" + $rootScope.corpus.pouchname + "/",
    //             $scope);
    //           arrayOfEventualData.push(newDatumFromServer);
    //         }
    //         if(arrayOfEventualData.length >= expectedCount){
    //           deferred.resolve(arrayOfEventualData);
    //         }
    //       });
    //     });

    //     return deferred.resolve();
    //   });
    //   return deferred.promise;
    // };

    var getDataBySession = function(DB, sessionID) {
      if (!sessionID) {
        return this.getDocFromCouchDB(DB, sessionID);
      }

      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var promise,
        config;

      config = {
        method: "GET",
        url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_list/as_data_list/list_of_data_by_session?key=%22sessionIDYouWantToSee%22".replace("sessionIDYouWantToSee", sessionID),
        withCredentials: true
      };
      console.log("Contacting the DB to get all corpus data for " + DB);
      promise = $http(config).then(function(response) {
        console.log("Receiving data results ");
        if (!response || !response.data || !response.data[sessionID] || !response.data[sessionID].datumIds) {
          return [];
        }
        return response.data[sessionID].datumIds.map(function(uuid) {
          return {
            _id: uuid,
            loading: true
          };
        });
      });
      return promise;
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
        config.url = config.url + "/" + newRecord._id + "?rev=" + newRecord._rev;
      }

      console.log("Contacting the DB to save record. " + config.url);
      var promise = $http(config).then(function(response) {
        return response;
      });
      return promise;
    };

    var getBlankDataTemplateFromCorpus = function(fieldsType) {
      if (!fieldsType) {
        throw "You must specify a type of fields: datumFields or sessionFields or participantFields etc";
      }
      var newDoc = {
        "session": {},
        "audioVideo": [],
        "images": [],
        "comments": [],
        "dateEntered": "",
        "dateModified": "",
        "timestamp": 0,
        "jsonType": "Datum",
        "collection": "datums"
      };
      if (fieldsType === "sessionFields") {
        newDoc = {
          "comments": [],
          "collection": "sessions",
          "dateCreated": "",
          "dateModified": ""
        };
      }
      if ($rootScope.corpus && $rootScope.corpus[fieldsType]) {
        if ($rootScope.corpus[fieldsType].clone) {
          newDoc[fieldsType] = $rootScope.corpus[fieldsType].clone();
        } else {
          newDoc[fieldsType] = JSON.parse(JSON.stringify($rootScope.corpus[fieldsType]));
        }
        return newDoc;
      } else {
        console.warn("Corpus is not ready.");
        throw "Corpus is not ready.";
      }
    };

    var datumFields = function(DB) {
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
    };

    var sessions = function(DB) {
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
        console.log("Receiving sessions ");
        return response.data.rows;
      });
      return promise;
    };

    var glosser = function(DB) {
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
    };

    var lexicon = function(DB) {
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
    };

    var getallusers = function(loginInfo) {
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
        console.log("Receiving all users on this team");
        return response.data.users;
      });
      return promise;
    };

    var login = function() {
      // if (!$rootScope.serverCode) {
      //   console.log("Sever code is undefined");
      //   window.location.assign("#/corpora_list");
      //   return;
      // }
      // var deferred = $q.defer();

      // var loginInfo = {
      //   authUrl: Servers.getServiceUrl($rootScope.serverCode, "auth"),
      //   username: user,
      //   password: password
      // };

      // FieldDB.FieldDBObject.application.authentication.login(loginInfo).then(
      //   function(user) {
      //     $rootScope.user = FieldDB.FieldDBObject.application.authentication.user;
      //     console.log("Logged in to corpus server.");
      //     deferred.resolve(user);
      //   },
      //   function(err) {
      //     console.warn(err);
      //     var message = "";
      //     if (err.status === 0) {
      //       message = "are you offline?";
      //       if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
      //         message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
      //       }
      //     }
      //     if (err && err.status >= 400 && err.data && err.data.userFriendlyErrors) {
      //       message = err.data.userFriendlyErrors;
      //     } else {
      //       message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
      //     }
      //     deferred.reject(message);

      //   });
      // return deferred.promise;
    };

    var register = function(newLoginInfo) {

      var config = {
        method: "POST",
        url: newLoginInfo.authUrl + "/register",
        data: newLoginInfo,
        withCredentials: true
      };
      var promise = $http(config).then(
        function(response) {
          console.log("Registered new user.");
          if (response.data.userFriendlyErrors) {
            $rootScope.notificationMessage = response.data.userFriendlyErrors[0];
            $rootScope.openNotification();
          } else {
            $rootScope.notificationMessage = "Welcome! Your username is " + response.data.user.username + "\nYou may now play with your Practice Corpus or browse some sample data in LingLlama's community corpus of Quechua data. You can also find a tutorial by clicking on the FAQ.";
            $rootScope.openNotification();

            login(response.data.user.username, newLoginInfo.password).then(function() {

              // Update saved state in Preferences and reload the page to the corpora list.
              var preferences = window.defaultPreferences;
              preferences.savedState.server = $rootScope.serverCode;
              preferences.savedState.username = $rootScope.user.username;
              preferences.savedState.password = sjcl.encrypt("password", newLoginInfo.password);
              localStorage.setItem('SpreadsheetPreferences', JSON.stringify(preferences));
              window.setTimeout(function() {
                if (window.location.hash.indexOf("register") > -1) {
                  window.location.assign("#/corpora_list");
                }
              }, 500);
            });
          }
          return response;
        },
        function(err) {
          console.warn(err);
          var message = "";
          if (err.status === 0) {
            message = "are you offline?";
            if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
              message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
            }
          }
          if (err && err.status >= 400 && err.data.userFriendlyErrors) {
            message = err.data.userFriendlyErrors.join(" ");
          } else {
            message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
          }

          $rootScope.notificationMessage = message;
          $rootScope.openNotification();
          $rootScope.loading = false;
          window.setTimeout(function() {
            window.open("https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform");
          }, 1500);

        });
      return promise;
    };

    var createcorpus = function(newCorpusInfo) {
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
              $rootScope.notificationMessage = response.data.info.join(" ") + "\nYou may now select this corpus.";
              $rootScope.openNotification();
            }
            return response.data;
          },
          function(err) {

            console.warn(err);
            var message = "";
            if (err.status === 0) {
              message = "are you offline?";
              if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
                message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
              }
            }
            if (err && err.status >= 400 && err.data.userFriendlyErrors) {
              message = err.data.userFriendlyErrors.join(" ");
            } else {
              message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
            }

            $rootScope.notificationMessage = message;
            $rootScope.openNotification();
            $rootScope.loading = false;
          });
      return promise;
    };

    var updateroles = function(newRoleInfo) {
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
              $rootScope.notificationMessage = response.data.info.join(" ");
              $rootScope.openNotification();
            }
            return response;
          },
          function(err) {
            console.warn(err);
            var message = "";
            if (err.status === 0) {
              message = "are you offline?";
              if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
                message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
              }
            }
            if (err && err.status >= 400 && err.data.userFriendlyErrors) {
              message = err.data.userFriendlyErrors.join(" ");
            } else {
              message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
            }

            $rootScope.notificationMessage = message;
            $rootScope.openNotification();
            $rootScope.loading = false;
          });
      return promise;
    };

    var removeroles = function(newRoleInfo) {
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
            console.log("Removed user roles.", response);
            $rootScope.notificationMessage = response.data.info.join(" ");
            $rootScope.openNotification();
            return response;
          },
          function(err) {
            console.warn(err);
            var message = "";
            if (err.status === 0) {
              message = "are you offline?";
              if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
                message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
              }
            }
            if (err && err.status >= 400 && err.data.userFriendlyErrors) {
              message = err.data.userFriendlyErrors.join(" ");
            } else {
              message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
            }

            $rootScope.notificationMessage = message;
            $rootScope.openNotification();
            $rootScope.loading = false;
          });
      return promise;
    };

    var saveSpreadsheetDatum = function(spreadsheetDatumToBeSaved) {
      var deferred = Q.defer();

      Q.nextTick(function() {
        // spreadsheetDatumToBeSaved.timestamp = Date.now();
        // spreadsheetDatumToBeSaved.dateModified = JSON.parse(JSON.stringify(new Date())); //These were done in the edit functions because the data might get saved an hour after it was modified... or more...
        var convertAndSaveAsFieldDBDatum = function(fieldDBDatumDocOrTemplate) {
          var fieldDBDatum;
          try {
            fieldDBDatum = SpreadsheetDatum.convertSpreadSheetDatumIntoFieldDBDatum(spreadsheetDatumToBeSaved, fieldDBDatumDocOrTemplate);
          } catch (e) {
            deferred.reject("Error saving datum: " + JSON.stringify(e));
            return;
          }
          saveCouchDoc(fieldDBDatum.pouchname, fieldDBDatum).then(function(response) {
            console.log(response);
            if (response.status >= 400) {
              deferred.reject("Error saving datum " + response.status);
              return;
            }
            if (!spreadsheetDatumToBeSaved.id) {
              spreadsheetDatumToBeSaved.id = response.data.id;
              spreadsheetDatumToBeSaved.rev = response.data.rev;
            }
            deferred.resolve(spreadsheetDatumToBeSaved);
          }, function(e) {
            var reason = "Error saving datum. Maybe you're offline?";
            if (e.data && e.data.reason) {
              reason = e.data.reason;
            } else if (e.status) {
              reason = "Error saving datum: " + e.status;
            }
            console.log(reason, fieldDBDatum, e);
            deferred.reject(reason);
          });
        };

        if (spreadsheetDatumToBeSaved.id) {
          getDocFromCouchDB(spreadsheetDatumToBeSaved.pouchname, spreadsheetDatumToBeSaved.id).then(convertAndSaveAsFieldDBDatum, function(e) {
            var reason = "Error getting the most recent version of the datum. Maybe you're offline?";
            if (e.data && e.data.reason) {
              if (e.data.reason === "missing") {
                e.data.reason = e.data.reason + " Please report this.";
              }
              reason = e.data.reason;
            } else if (e.status) {
              reason = "Error getting the most recent version of the datum: " + e.status;
            }
            console.log(reason, spreadsheetDatumToBeSaved, e);
            deferred.reject(reason);
          });
        } else {
          convertAndSaveAsFieldDBDatum(getBlankDataTemplateFromCorpus("datumFields"));
        }

      });
      return deferred.promise;
    };

    var blankDatumTemplate = function() {
      return getBlankDataTemplateFromCorpus("datumFields");
    };

    var blankSessionTemplate = function() {
      return getBlankDataTemplateFromCorpus("sessionFields");
    };

    var blankActivityTemplate = function() {
      var promise = $http
        .get('data/blank_activity_template.json').then(
          function(response) {
            return response.data;
          });
      return promise;
    };

    var removeRecord = function(DB, UUID, rev) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      console.log("You cannot delete items from the corpus.", rev);
      return;

      // var config = {
      //   method: "DELETE",
      //   url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/" + UUID + "?rev=" + rev,
      //   withCredentials: true
      // };

      // console.log("Contacting the DB to delete record. " + config.url);
      // var promise = $http(config).then(function(response) {
      //   return response;
      // });
      // return promise;
    };

    var forgotPassword = function(forgotPasswordInfo) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        data: forgotPasswordInfo,
        url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/forgotpassword",
        withCredentials: true
      };

      console.log("Contacting the server to forgot password. " + config.url);
      var promise = $http(config).then(function(response) {
        return response;
      });
      return promise;
    };

    var changePassword = function(changePasswordInfo) {
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
    };


    return {
      async: getDocFromCouchDB,
      getDataBySession: getDataBySession,
      datumFields: datumFields,
      sessions: sessions,
      glosser: glosser,
      lexicon: lexicon,
      getallusers: getallusers,
      login: login,
      register: register,
      createcorpus: createcorpus,
      updateroles: updateroles,
      removeroles: removeroles,
      saveCouchDoc: saveCouchDoc,
      saveSpreadsheetDatum: saveSpreadsheetDatum,
      blankDatumTemplate: blankDatumTemplate,
      blankSessionTemplate: blankSessionTemplate,
      blankActivityTemplate: blankActivityTemplate,
      removeRecord: removeRecord,
      forgotPassword: forgotPassword,
      changePassword: changePassword
    };
  });
