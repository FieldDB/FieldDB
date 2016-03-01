'use strict';
define(["angular", "OPrime"], function(angular, OPrime) {
  /* Directives */

  var ActivityFeedDirectives = angular.module('ActivityFeed.directives', [])
    .directive('appVersion', ['version', function(version) {
      return function(scope, elm, attrs) {
        elm.text('3.42.8');
      };
    }]);

  OPrime.debug("Defining ActivityFeedDirectives.");

  return ActivityFeedDirectives;
});
