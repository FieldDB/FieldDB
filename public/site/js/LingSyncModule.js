'use strict';

// Declare app level module which depends on filters, and services
angular.module('LingSyncWebsite', [ ]).config(
    [ '$routeProvider', function($routeProvider) {
      $routeProvider.when('/home', {
        templateUrl : 'site/partials/home.html'
      }).when('/technology', {
        templateUrl : 'site/partials/technology.html' , controller: LingSyncWebsiteTechnologyController
      }).when('/people', {
        templateUrl : 'site/partials/people.html'
      }).when('/tutorials', {
        templateUrl : 'site/partials/tutorials.html'
      }).when('/projects', {
        templateUrl : 'site/partials/projects.html'
      }).when('/download', {
        templateUrl : 'site/partials/download.html'
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