'use strict';
/* globals FieldDB */


/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbAuthentication
 * @description
 * # fielddbAuthentication
 */
angular.module('fielddbAngularApp').directive('fielddbAuthentication', function() {
  FieldDB.BASE_DB_URL = 'https://corpusdev.example.org';
  FieldDB.BASE_AUTH_URL = 'https://authdev.example.org';


  var controller = function($scope, $location) {

    var processUserDetails = function(user) {
      user.authenticated = true;
      user.accessibleDBS = user.accessibleDBS || [];
      $scope.authentication.user = user;
      // $scope.team = user;
      // $rootScope.authenticated = true;
      user.roles.map(function(role) {
        var dbname = role.substring(0, role.lastIndexOf('_'));
        if (role.indexOf('-') > -1 && role.indexOf('_reader') > -1 && user.accessibleDBS.indexOf(dbname) === -1) {
          user.accessibleDBS.push(dbname);
        }
      });
      console.log($scope);
      if (window.location.pathname === '/welcome' || window.location.pathname === '/bienvenu') {
        $scope.$apply(function() {
          $location.path('/' + $scope.authentication.user.accessibleDBS[0].replace("-","/"));
        });
      }
      $scope.$digest();
    };

    $scope.loginDetails = $scope.loginDetails || {};

    $scope.authenticate = function(loginDetails) {
      $scope.isContactingServer = true;
      $scope.status = "";
      var db = new FieldDB.PsycholinguisticsDatabase({
        username: loginDetails.username,
        dbname: 'default',
        url: FieldDB.BASE_DB_URL,
        authUrl: FieldDB.BASE_AUTH_URL
      });
      db.login(loginDetails).then(function(user) {
        console.log("User has been downloaded. ", user);
        processUserDetails(user);
        // $scope.isContactingServer = false;
      }, function(reason) {
        $scope.status = reason;
        // $scope.isContactingServer = false;
      }).catch(function() {
        $scope.isContactingServer = false;
        $scope.loginDetails.password = "";
        $scope.$digest();
      }).done(function() {
        $scope.isContactingServer = false;
        $scope.loginDetails.password = "";
        $scope.$digest();
      });
    };

    $scope.logout = function() {
      $scope.status = "";
      var db = new FieldDB.PsycholinguisticsDatabase({
        username: $scope.loginDetails.username,
        dbname: 'default',
        url: FieldDB.BASE_DB_URL,
        authUrl: FieldDB.BASE_AUTH_URL
      });
      db.logout().then(function(user) {
        console.log("User has been logged out. ");
        $scope.authentication = {};
        if (window.location.pathname !== '/welcome' && window.location.pathname !== '/bienvenu') {
          $scope.$apply(function() {
            $location.path('/welcome/');
          });
        }
        $scope.$digest();
      }, function(reason) {
        $scope.status = reason;
        $scope.$digest();
      }).done(function() {
        $scope.isContactingServer = false;
        $scope.$digest();
      });
    };

    console.log('Scope authentication is ', $scope);
    $scope.authentication = $scope.authentication || {};
    var user = {
      accessibleDBS: []
    };
    FieldDB.CORS.makeCORSRequest({
      type: 'GET',
      dataType: 'json',
      url: FieldDB.BASE_DB_URL + '/_session'
    }).then(function(sessionInfo) {
      console.log(sessionInfo);
      if (sessionInfo.ok && sessionInfo.userCtx.name) {
        user.username = sessionInfo.userCtx.name;
        user.roles = sessionInfo.userCtx.roles;
        processUserDetails(user);
      } else {
        $scope.$apply(function() {
          $location.path('/welcome');
        });
      }
    }, function(reason) {
      console.log('Unable to login ', reason);
      $scope.$apply(function() {
        $location.path('/welcome');
      });
    });
  };
  controller.$inject = ['$scope', '$location'];

  var directiveDefinitionObject = {
    templateUrl: 'views/authentication.html', // or // function(tElement, tAttrs) { ... },
    restrict: 'A',
    transclude: false,
    // scope: {
    //   authentication: '=json'
    // },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: true,
    controllerAs: 'stringAlias'

  };
  return directiveDefinitionObject;
});
