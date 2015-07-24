/* globals  FieldDB */
'use strict';
console.log("Declaring the SpreadsheetStyleDataEntryServices.");

angular.module('spreadsheetApp')
  .factory('Data', function($http, $rootScope) {


    var glosser = function(DB) {
      if (!FieldDB.FieldDBObject.application || !FieldDB.FieldDBObject.application.connection) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "GET",
        url: FieldDB.FieldDBObject.application.connection.corpusUrl + "/" + DB + "/_design/pages/_view/morpheme_n_grams?group=true",
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

    var blankActivityTemplate = function() {
      var promise = $http
        .get('data/blank_activity_template.json').then(
          function(response) {
            return response.data;
          });
      return promise;
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
      glosser: glosser,
      lexicon: lexicon,
      updateroles: updateroles,
      removeroles: removeroles,
      blankActivityTemplate: blankActivityTemplate,
      forgotPassword: forgotPassword,
      changePassword: changePassword
    };
  });
