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
  var controller = function($scope, $location) {
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
        user.authenticated = true;
        $scope.authentication.user = user;
        // $rootScope.authenticated = true;
        sessionInfo.userCtx.roles.map(function(role) {
          var dbname = role.substring(0, role.lastIndexOf('_'));
          if (role.indexOf('-') > -1 && role.indexOf('_reader') > -1 && user.accessibleDBS.indexOf(dbname) === -1) {
            user.accessibleDBS.push(dbname);
          }
        });
        console.log($scope);
        if (window.location.pathname === '/welcome' || window.location.pathname === '/bienvenu') {
          $scope.$apply(function() {
            $location.path('/db/' + $scope.authentication.user.accessibleDBS[0]);
          });
        }
        $scope.$digest();
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
