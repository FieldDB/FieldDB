"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbUser
 * @description
 * # fielddbUser
 */
angular.module("fielddbAngularApp").directive("fielddbUser", function() {


  var controller = function($scope) {
    $scope.toggleViewDecryptedDetails = function() {
      $scope.user.decryptedMode = !$scope.user.decryptedMode;
    };
  };
  controller.$inject = ["$scope"];

  var directiveDefinitionObject = {
    templateUrl: function(elem, attrs) {
      if (attrs.view === "User") {
        return "views/user-page.html";
      } else if (attrs.view === "UserMask") {
        return "views/user.html";
      } else if (attrs.view === "Participant") {
        return "views/participant.html";
      } else {
        return "views/user.html";
      }
    },
    restrict: "A",
    transclude: false,
    scope: {
      user: "=json"
    },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: false,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});
