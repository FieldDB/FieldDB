"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbSession
 * @description
 * # fielddbSession
 */
angular.module("fielddbAngular").directive("fielddbSession", function() {
  return {
    templateUrl: "components/session/session.html",
    restrict: "A",
    transclude: false,
    scope: {
      session: "=json",
      corpus: "=corpus"
    },
    controller: function($scope, $rootScope) {
      $scope.toggleViewDecryptedDetails = function() {
        $scope.session.decryptedMode = !$scope.session.decryptedMode;
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
