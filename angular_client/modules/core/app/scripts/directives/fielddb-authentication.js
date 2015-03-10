"use strict";


/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbAuthentication
 * @description
 * # fielddbAuthentication
 */
angular.module("fielddbAngularApp").directive("fielddbAuthentication", function() {

  var controller = function($scope) {
    /* initialize or confirm scope is prepared */
    $scope.loginDetails = $scope.loginDetails || {};
    // $scope.application.authentication = $scope.application.authentication || {};
    // $scope.application.authentication.user = $scope.application.authentication.user || {};
    if ($scope.application && typeof $scope.application.debug === "function") {
      $scope.application.debug("Scope authentication is ", $scope.application.authentication);
    } else {
      console.warn("Somethign is wrong, there is no app defined. ");
    }

    $scope.register = function(loginDetails) {
      console.warn("TODO use $scope.corpus.register", loginDetails);
      $scope.application.authentication.register(loginDetails).then(function(user) {
        console.log("User has been downloaded. listen to 'authenticated' event to redirect the user", user);
      }, function(error) {
        $scope.application.authentication.error = error.userFriendlyErrors.join(" ");
        $scope.application.authentication.render();
      });
    };

    $scope.login = function(loginDetails) {
      $scope.application.authentication.login(loginDetails).then(function(user) {
        console.log("User has been downloaded. listen to 'authenticated' event to redirect the user", user);
      }, function(error) {
        $scope.application.authentication.error = error.userFriendlyErrors.join(" ");
        $scope.application.authentication.render();
      });
    };

    $scope.logout = function() {
      $scope.application.authentication.logout().then(function(serverReply) {
        console.log("User has been logged out. ", serverReply);
        // $scope.application.authentication = {
        //   user: new FieldDB.User({
        //     authenticated: false
        //   })
        // };
        // if (window.location.pathname.indexOf("welcome") < 0 && window.location.pathname.indexOf("bienvenu") < 0) {
        //   $scope.$apply(function() {
        //     // $location.path($scope.application.basePathname +  "/#/welcome/", false);
        //     window.location.replace($scope.application.basePathname + "/#/welcome");
        //   });
        // }
        // $scope.$digest();
      }, function(error) {
        $scope.application.authentication.error = error.userFriendlyErrors.join(" ");
        $scope.$digest();
      });
    };


  };
  controller.$inject = ["$scope"];

  /* Directive declaration */
  var directiveDefinitionObject = {
    templateUrl: "views/authentication.html", // or // function(tElement, tAttrs) { ... },
    restrict: "A",
    transclude: false,
    // scope: {
    //   authentication: "=json"
    // },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: true,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});
