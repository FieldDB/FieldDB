"use strict";
/* globals FieldDB */

angular.module("fielddbAngularApp").controller("FieldDBController", ["$scope", "$routeParams", "$rootScope",
  function($scope, $routeParams) {

    if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
      $scope.application = FieldDB.FieldDBObject.application;
    } else {
      console.warn("The fielddb application was never created, are you sure you didn new FieldDB.APP() somewhere?");
      window.alert("The app is broken, please report this. ");
    }

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
    $scope.application.processRouteParams($routeParams);
    // FieldDB.FieldDBConnection.connect();

    console.log("FieldDBController was loaded, this means almost everything in the corpus is available now");
  }
]);
