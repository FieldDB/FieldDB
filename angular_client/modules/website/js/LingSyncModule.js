'use strict';

// Declare app level module which depends on filters, and services
angular.module('LingSyncWebsite', [ ]).config(
    [ '$routeProvider', function($routeProvider) {
      $routeProvider.when('/home', {
        templateUrl : 'partials/home.html'
      }).when('/technology', {
        templateUrl : 'partials/technology.html'
      }).when('/people', {
        templateUrl : 'partials/people.html'
      }).when('/tutorials', {
        templateUrl : 'partials/tutorials.html'
      }).when('/projects', {
        templateUrl : 'partials/projects.html'
      }).otherwise({
        redirectTo : '/home'
      });
    } ]).directive('ngEnter', function() {
  return function(scope, elm, attrs) {
    elm.bind('keypress', function(e) {
      if (e.charCode === 13) {
        scope.$apply(attrs.ngEnter);
        elm[0].blur();
      }
    });
  };
});