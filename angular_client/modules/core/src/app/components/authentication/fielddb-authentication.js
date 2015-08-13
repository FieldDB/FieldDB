"use strict";


/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbAuthentication
 * @description
 * # fielddbAuthentication
 */
angular.module("fielddbAngular").directive("fielddbAuthentication", function() {

  var controller = function($scope, $rootScope) {
    /* initialize or confirm scope is prepared */
    $scope.loginDetails = $scope.loginDetails || {};
    // $scope.application.authentication = $scope.application.authentication || {};
    // $scope.application.authentication.user = $scope.application.authentication.user || {};
    if ($scope.application && typeof $scope.application.debug === "function") {
      $scope.application.debug("Scope authentication is ", $scope.application.authentication);
    } else {
      console.warn("Somethign is wrong, there is no app defined. ");
    }

    $rootScope.register = function(registerDetails) {
      console.log("running register");
      try {
        return $scope.application.authentication.register(registerDetails).then(function(user) {
          console.log("User has been downloaded. listen to 'authenticated' event to redirect the user", user);
          return $scope;
        }, function(error) {
          $scope.application.authentication.error = error.userFriendlyErrors.join(" ");
          if ($scope.application.authentication.error.toLowerCase().indexOf("username") > -1) {
            registerDetails.username = "";
          }
          $scope.application.authentication.render();
          return $scope;
        });

      } catch (e) {
        console.log("there was a problem running register", e);
      }
    };

    $scope.login = function(loginDetails) {
      return $scope.application.authentication.login(loginDetails).then(function(user) {
        console.log("User has been downloaded. listen to 'authenticated' event to redirect the user", user);
        return $scope;
      }, function(error) {
        $scope.application.authentication.error = error.userFriendlyErrors.join(" ");
        $scope.application.authentication.render();
        return $scope;
      });
    };

    $scope.logout = function() {
      return $scope.application.authentication.logout().then(function(serverReply) {
        console.log("User has been logged out. ", serverReply);
        return $scope;
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
        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.warn("render threw errors");
        }
        return $scope;
      });
    };


  };
  controller.$inject = ["$scope", "$rootScope"];

  /* Directive declaration */
  var directiveDefinitionObject = {
    templateUrl: "components/authentication/authentication.html", // or // function(tElement, tAttrs) { ... },
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
