"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbDatum
 * @description
 * # fielddbDatum
 */
angular.module("fielddbAngular").directive("fielddbDatum", function() {
  return {
    templateUrl: "app/components/datum/datum_generic.html",
    restrict: "A",
    transclude: false,
    scope: {
      datum: "=json",
      corpus: "=corpus"
    },
    controller: function($scope, $rootScope) {
      $scope.toggleViewDecryptedDetails = function() {
        $scope.datum.decryptedMode = !$scope.datum.decryptedMode;
      };
      $scope.showThisFieldForThisUserType = function(field) {
        // Don"t show empty fields
        if (!field.value) {
          return false;
        }
        if (!$rootScope.application || !$rootScope.application.prefs) {
          return true;
        }
        // Only values which would be interesting for this user
        var prefs = $rootScope.application.prefs;
        // console.log(prefs);
        var userType = prefs.preferredDashboardType || "experimenterNormalUser";
        if (!field.showToUserTypes) {
          return true;
        }
        var showToTypes = field.showToUserTypes.trim().split(",");
        for (var type = 0; type < showToTypes.length; type++) {
          if (showToTypes[type].trim() === "all" || userType.indexOf(showToTypes[type].trim()) > -1) {
            return true;
          } else {
            return false;
          }
        }
      };
      $scope.expanded = false;
      $scope.toggleExpanded = function() {
        $scope.expanded = !$scope.expanded;
      };

    },
    link: function postLink() {}
  };
});
