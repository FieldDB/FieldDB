/* globals  Q, SpreadsheetDatum, FieldDB */
'use strict';
console.log("Declaring the SpreadsheetStyleDataEntryServices.");

angular.module('spreadsheetApp')
  .factory('Data', function($http, $rootScope) {

    var getDocFromCouchDB = function(DB, UUID) {
      if (true) {
        console.warn("getDocFromCouchDB is deprecated",DB, UUID);
      }
    };

    var saveCouchDoc = function(DB, newRecord) {
      if (true) {
        console.warn("saveCouchDoc is deprecated", DB, newRecord);
      }
    };

    var getBlankDataTemplateFromCorpus = function(fieldsType) {
      if (true) {
        console.warn("getBlankDataTemplateFromCorpus is deprecated", fieldsType);
      }
    };

    var datumFields = function(DB) {
      if (true) {
        console.warn("getBlankDataTemplateFromCorpus is deprecated", DB);
      }
    };

    var sessions = function(DB) {
      if (true) {
        console.warn("getBlankDataTemplateFromCorpus is deprecated", DB);
      }
    };

    var glosser = function(DB) {
      if (!FieldDB.FieldDBObject.application || !FieldDB.FieldDBObject.application.connection) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "GET",
        url: FieldDB.FieldDBObject.application.connection.corpusUrl + "/" + DB + "/_design/pages/_view/precedence_rules?group=true",
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
      if (!FieldDB.FieldDBObject.application || !FieldDB.FieldDBObject.application.connection) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "GET",
        url: FieldDB.FieldDBObject.application.connection.corpusUrl + "/" + DB + "/_design/pages/_view/lexicon_create_tuples?group=true",
        withCredentials: true
      };

      console.log("Contacting the DB to get lexicon for " + config.url);
      var promise = $http(config).then(function(response) {
        console.log("Receiving lexicon ");
        return response.data.rows;
      });
      return promise;
    };


    var updateroles = function(newRoleInfo) {
      if (!FieldDB.FieldDBObject.application || !FieldDB.FieldDBObject.application.connection) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        url: FieldDB.FieldDBObject.application.connection.authUrl + "/updateroles",
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
              if (FieldDB.FieldDBObject.application.connection.userFriendlyServerName === "mcgill" || FieldDB.FieldDBObject.application.connection.userFriendlyServerName === "concordia") {
                message = "Cannot contact " + FieldDB.FieldDBObject.application.connection.userFriendlyServerName + " server, have you accepted the server's security certificate? (please refer to your registration email)";
              }
            }
            if (err && err.status >= 400 && err.data.userFriendlyErrors) {
              message = err.data.userFriendlyErrors.join(" ");
            } else {
              message = "Cannot contact " + FieldDB.FieldDBObject.application.connection.userFriendlyServerName + " server, please report this.";
            }

            $rootScope.notificationMessage = message;
            $rootScope.openNotification();
            $rootScope.loading = false;
          });
      return promise;
    };

    var removeroles = function(newRoleInfo) {
      if (!FieldDB.FieldDBObject.application || !FieldDB.FieldDBObject.application.connection) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        url: FieldDB.FieldDBObject.application.connection.authUrl + "/updateroles",
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
              if (FieldDB.FieldDBObject.application.connection.userFriendlyServerName === "mcgill" || FieldDB.FieldDBObject.application.connection.userFriendlyServerName === "concordia") {
                message = "Cannot contact " + FieldDB.FieldDBObject.application.connection.userFriendlyServerName + " server, have you accepted the server's security certificate? (please refer to your registration email)";
              }
            }
            if (err && err.status >= 400 && err.data.userFriendlyErrors) {
              message = err.data.userFriendlyErrors.join(" ");
            } else {
              message = "Cannot contact " + FieldDB.FieldDBObject.application.connection.userFriendlyServerName + " server, please report this.";
            }

            $rootScope.notificationMessage = message;
            $rootScope.openNotification();
            $rootScope.loading = false;
          });
      return promise;
    };

    // var saveSpreadsheetDatum = function(spreadsheetDatumToBeSaved) {
    //   var deferred = Q.defer();

    //   Q.nextTick(function() {
    //     // spreadsheetDatumToBeSaved.timestamp = Date.now();
    //     // spreadsheetDatumToBeSaved.dateModified = JSON.parse(JSON.stringify(new Date())); //These were done in the edit functions because the data might get saved an hour after it was modified... or more...
    //     var convertAndSaveAsFieldDBDatum = function(fieldDBDatumDocOrTemplate) {
    //       var fieldDBDatum;
    //       try {
    //         fieldDBDatum = SpreadsheetDatum.convertSpreadSheetDatumIntoFieldDBDatum(spreadsheetDatumToBeSaved, fieldDBDatumDocOrTemplate);
    //       } catch (e) {
    //         deferred.reject("Error saving datum: " + JSON.stringify(e));
    //         return;
    //       }
    //       saveCouchDoc(fieldDBDatum.dbname, fieldDBDatum).then(function(response) {
    //         console.log(response);
    //         if (response.status >= 400) {
    //           deferred.reject("Error saving datum " + response.status);
    //           return;
    //         }
    //         if (!spreadsheetDatumToBeSaved.id) {
    //           spreadsheetDatumToBeSaved.id = response.data.id;
    //           spreadsheetDatumToBeSaved.rev = response.data.rev;
    //         }
    //         deferred.resolve(spreadsheetDatumToBeSaved);
    //       }, function(e) {
    //         var reason = "Error saving datum. Maybe you're offline?";
    //         if (e.data && e.data.reason) {
    //           reason = e.data.reason;
    //         } else if (e.status) {
    //           reason = "Error saving datum: " + e.status;
    //         }
    //         console.log(reason, fieldDBDatum, e);
    //         deferred.reject(reason);
    //       });
    //     };

    //     if (spreadsheetDatumToBeSaved.id) {
    //       getDocFromCouchDB(spreadsheetDatumToBeSaved.dbname, spreadsheetDatumToBeSaved.id).then(convertAndSaveAsFieldDBDatum, function(e) {
    //         var reason = "Error getting the most recent version of the datum. Maybe you're offline?";
    //         if (e.data && e.data.reason) {
    //           if (e.data.reason === "missing") {
    //             e.data.reason = e.data.reason + " Please report this.";
    //           }
    //           reason = e.data.reason;
    //         } else if (e.status) {
    //           reason = "Error getting the most recent version of the datum: " + e.status;
    //         }
    //         console.log(reason, spreadsheetDatumToBeSaved, e);
    //         deferred.reject(reason);
    //       });
    //     } else {
    //       convertAndSaveAsFieldDBDatum(getBlankDataTemplateFromCorpus("datumFields"));
    //     }

    //   });
    //   return deferred.promise;
    // };

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
      if (!FieldDB.FieldDBObject.application || !FieldDB.FieldDBObject.application.connection) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      console.log("You cannot delete items from the corpus.", rev);
      return;

      // var config = {
      //   method: "DELETE",
      //   url: FieldDB.FieldDBObject.application.connection.corpusUrl + "/" + DB + "/" + UUID + "?rev=" + rev,
      //   withCredentials: true
      // };

      // console.log("Contacting the DB to delete record. " + config.url);
      // var promise = $http(config).then(function(response) {
      //   return response;
      // });
      // return promise;
    };

    var forgotPassword = function(forgotPasswordInfo) {
      if (!FieldDB.FieldDBObject.application || !FieldDB.FieldDBObject.application.connection) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        data: forgotPasswordInfo,
        url: FieldDB.FieldDBObject.application.connection.authUrl + "/forgotpassword",
        withCredentials: true
      };

      console.log("Contacting the server to forgot password. " + config.url);
      var promise = $http(config).then(function(response) {
        return response;
      });
      return promise;
    };

    var changePassword = function(changePasswordInfo) {
      if (!FieldDB.FieldDBObject.application || !FieldDB.FieldDBObject.application.connection) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        data: changePasswordInfo,
        url: FieldDB.FieldDBObject.application.connection.authUrl + "/changepassword",
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
      datumFields: datumFields,
      sessions: sessions,
      glosser: glosser,
      lexicon: lexicon,
      updateroles: updateroles,
      removeroles: removeroles,
      saveCouchDoc: saveCouchDoc,
      // saveSpreadsheetDatum: saveSpreadsheetDatum,
      blankDatumTemplate: blankDatumTemplate,
      blankSessionTemplate: blankSessionTemplate,
      blankActivityTemplate: blankActivityTemplate,
      removeRecord: removeRecord,
      forgotPassword: forgotPassword,
      changePassword: changePassword
    };
  });
