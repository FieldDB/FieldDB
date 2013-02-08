'use strict';
define([ "angular", "OPrime" ], function(angular, OPrime) {
  /* Directives */

  var ActivityFeedDirectives = angular.module('ActivityFeed.directives', [])
      .directive('appVersion', [ 'version', function(version) {
        return function(scope, elm, attrs) {
          elm.text(version);
        };
      } ]);
  
  OPrime.debug("Defining ActivityFeedDirectives.");

  return ActivityFeedDirectives;
});