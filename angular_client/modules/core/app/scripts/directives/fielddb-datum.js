'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDatum
 * @description
 * # fielddbDatum
 */
angular.module('fielddbAngularApp').directive('fielddbDatum', function() {
  return {
    templateUrl: 'views/datum.html',
    restrict: 'A',
    transclude: false,
    scope: {
      datum: '=json'
    },
    controller: function($scope) {
      $scope.toggleViewDecryptedDetails = function() {
        $scope.datum.decryptedMode = !$scope.datum.decryptedMode;
      };
    },
    link: function postLink() {}
  };
});
