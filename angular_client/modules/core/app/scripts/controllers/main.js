"use strict";
/* globals FieldDB */

angular.module("fielddbAngularApp").controller("FieldDBController", ["$scope", "$routeParams", "$rootScope",
  function($scope, $routeParams, $rootScope) {

    if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
      $scope.application = FieldDB.FieldDBObject.application;
    } else {
      console.warn("The fielddb application was never created, are you sure you did new FieldDB.APP() somewhere?");
      window.alert("The app cannot load, please report this. ");
    }
    $rootScope.contextualize = function(message) {
      if (!FieldDB || !FieldDB.FieldDBObject || !FieldDB.FieldDBObject.application || !FieldDB.FieldDBObject.application.contextualizer || !FieldDB.FieldDBObject.application.contextualizer.data) {
        return message;
      }
      var result = FieldDB.FieldDBObject.application.contextualize(message);
      // if (!$scope.$$phase) {
      //   $scope.$digest(); //$digest or $apply
      // }
      return result;
    };

    $scope.application.render = function() {
      if (!$scope.$$phase) {
        $scope.$apply(); //$digest or $apply
      }
    };

    $scope.loginDetails = $scope.loginDetails || {
      username: "",
      password: ""
    };
    $scope.application.debug($scope.application);
    if ($routeParams) {
      $scope.application.processRouteParams($routeParams);
    }
    // FieldDB.FieldDBConnection.connect();

    console.log("FieldDBController was loaded, this means almost everything in the corpus is available now");
  }
]);
