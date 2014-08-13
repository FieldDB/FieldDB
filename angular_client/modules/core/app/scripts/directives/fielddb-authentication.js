'use strict';
/* globals FieldDB */


/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbAuthentication
 * @description
 * # fielddbAuthentication
 */
angular.module('fielddbAngularApp').directive('fielddbAuthentication', function() {
  FieldDB.BASE_DB_URL = 'https://localhost:6984';
  FieldDB.BASE_AUTH_URL = 'https://localhost:3183';

  var controller = function($scope, $location) {
    /* initialize or confirm scope is prepared */
    $scope.loginDetails = $scope.loginDetails || {};
    $scope.authentication = $scope.authentication || {};
    $scope.authentication.user = $scope.authentication.user || {
      accessibleDBS: []
    };
    console.log('Scope authentication is ', $scope);

    var processUserDetails = function(user) {
      user.authenticated = true;
      user.accessibleDBS = user.accessibleDBS || [];
      $scope.authentication.user = new FieldDB.User(user);

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
          $location.path('/' + $scope.authentication.user.accessibleDBS[0].replace('-', '/'));
        });
      }
      $scope.$digest();
    };
    $scope.register = function(registerDetails) {
      console.warn('TODO', registerDetails);
    };

    $scope.login = function(loginDetails) {
      $scope.isContactingServer = true;
      $scope.authentication.error = '';
      var db = new FieldDB.Database({
        username: loginDetails.username,
        dbname: 'default',
        url: FieldDB.BASE_DB_URL,
        authUrl: FieldDB.BASE_AUTH_URL
      });
      db.login(loginDetails).then(function(user) {
        console.log('User has been downloaded. ', user);
        processUserDetails(user);
        // $scope.isContactingServer = false;
      }, function(reason) {
        $scope.authentication.error = reason;
        // $scope.isContactingServer = false;
      }).catch(function() {
        $scope.isContactingServer = false;
        $scope.loginDetails.password = '';
        $scope.$digest();
      }).done(function() {
        $scope.isContactingServer = false;
        $scope.loginDetails.password = '';
        $scope.$digest();
      });
    };

    $scope.logout = function() {
      $scope.authentication.error = '';
      var db = new FieldDB.Database({
        username: $scope.loginDetails.username,
        dbname: 'default',
        url: FieldDB.BASE_DB_URL,
        authUrl: FieldDB.BASE_AUTH_URL
      });
      db.logout().then(function(serverReply) {
        console.log('User has been logged out. ', serverReply);
        $scope.authentication = {};
        if (window.location.pathname !== '/welcome' && window.location.pathname !== '/bienvenu') {
          $scope.$apply(function() {
            $location.path('/welcome/');
          });
        }
        $scope.$digest();
      }, function(reason) {
        $scope.authentication.error = reason;
        $scope.$digest();
      }).done(function() {
        $scope.isContactingServer = false;
        $scope.$digest();
      });
    };

    $scope.resumeAuthenticationSession = function() {
      FieldDB.CORS.makeCORSRequest({
        type: 'GET',
        dataType: 'json',
        url: FieldDB.BASE_DB_URL + '/_session'
      }).then(function(sessionInfo) {
        console.log(sessionInfo);
        if (sessionInfo.ok && sessionInfo.userCtx.name) {
          $scope.authentication.user.username = sessionInfo.userCtx.name;
          $scope.authentication.user.roles = sessionInfo.userCtx.roles;
          processUserDetails($scope.authentication.user);
        } else {
          $scope.$apply(function() {
            $location.path('/welcome');
          });
        }
      }, function(reason) {
        console.log('Unable to login ', reason);
        $scope.error = 'Unable to resume.';
        $scope.$digest();
        // $scope.$apply(function() {
        //   $location.path('/welcome');
        // });
      });
    };
    $scope.resumeAuthenticationSession();


  };
  controller.$inject = ['$scope', '$location'];

  /* Directive declaration */
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
