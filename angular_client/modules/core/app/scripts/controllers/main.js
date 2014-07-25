'use strict';

angular.module('fielddbAngularApp').controller('FieldDBController', ['$scope',
  function($scope) {
    $scope.connection = {
      online: true,
      apiURL: 'https://localhost:3181/v2/',
      offlineCouchURL: 'https://localhost:6984'
    };
    $scope.authentication = {
      // user: {
      //   authenticated: true
      // }
    };

    // FieldDB.FieldDBConnection.connect();

    console.log('In the FieldDBController', $scope.connection);
  }
]);
