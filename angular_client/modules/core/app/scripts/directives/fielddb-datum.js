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
    controller: function($scope, $rootScope) {
      $scope.toggleViewDecryptedDetails = function() {
        $scope.datum.decryptedMode = !$scope.datum.decryptedMode;
      };
      $scope.showThisFieldForThisUserType = function(field) {
        // Don't show empty fields
        if (!field.value) {
          return false;
        }
        // Only values which would be interesting for this user
        var prefs = $rootScope.getUserPreferences()
        console.log(prefs);
        var userType = prefs.preferedDashboardType || "experimenterNormalUser";
        if (!field.showToUserTypes) {
          return true;
        }
        if (field.showToUserTypes === "all" || userType.indexOf(field.showToUserTypes) > -1) {
          return true;
        } else {
          return false;
        }
      };

    },
    link: function postLink() {}
  };
});
