'use strict';
/* globals FieldDB */

angular.module('fielddbAngularApp').controller('FieldDBController', ['$scope', '$routeParams', '$rootScope',
  function($scope, $routeParams) {

    $scope.application = FieldDB.FieldDBObject.application;
    $scope.application.render = function(){
      $scope.$apply();
    };

    $scope.loginDetails = $scope.loginDetails || {
      username: '',
      password: ''
    };
    console.log($scope.application);
    $scope.application.processRouteParams($routeParams);
    // FieldDB.FieldDBConnection.connect();

    console.log('In the FieldDBController');
  }
]);
