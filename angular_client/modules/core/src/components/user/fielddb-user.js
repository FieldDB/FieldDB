"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbUser
 * @description
 * # fielddbUser
 */
angular.module("fielddbAngular").directive("fielddbUser", function() {


  var controller = function($scope) {
    $scope.toggleViewDecryptedDetails = function() {
      $scope.user.decryptedMode = !$scope.user.decryptedMode;
    };
    // console.log("$scope.user");
    // console.log($scope.user);
    // if (!$scope.user) {
    //   console.warn("This user is undefined for this directive, seems odd.");
    //   // console.warn("This user is undefined for this directive, seems odd.", $scope);
    // } else {
    //   if ($scope.user.toJSON) {
    //     console.log($scope.user.toJSON());
    //   }
    // }
  };
  controller.$inject = ["$scope"];

  var directiveDefinitionObject = {
    templateUrl: function(elem, attrs) {
      if (attrs.view === "User") {
        return "components/user/user-page.html";
      } else if (attrs.view === "UserMask") {
        return "components/user/user.html";
      } else if (attrs.view === "Participant") {
        return "components/user/participant.html";
      } else {
        return "components/user/user.html";
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
