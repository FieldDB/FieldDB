'use strict';

// Declare app level module which depends on filters, and services
angular.module('LingSyncWebsite', [ ]).config(
    [ '$routeProvider', function($routeProvider) {
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
