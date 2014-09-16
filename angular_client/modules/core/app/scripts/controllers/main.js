'use strict';
/* globals FieldDB */

angular.module('fielddbAngularApp').controller('FieldDBController', ['$scope', '$routeParams', '$rootScope',
  function($scope, $routeParams, $rootScope) {

    $rootScope.application = FieldDB.FieldDBObject.application;
    $rootScope.application.render = function(){
      $scope.$apply();
    };

    $scope.loginDetails = $scope.loginDetails || {
      username: '',
      password: ''
    };
    console.log($rootScope.application);
    $rootScope.application.processRouteParams($routeParams);
    // FieldDB.FieldDBConnection.connect();

    console.log('In the FieldDBController', $scope.connection);
  }
]);
