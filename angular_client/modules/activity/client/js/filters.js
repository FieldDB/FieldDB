'use strict';
define([ "angular", "OPrime" ], function(angular, OPrime) {

  /* Filters */

  var ActivityFeedFilters = angular.module('ActivityFeed.filters', []).filter(
      'interpolate', [ 'version', function(version) {
        return function(text) {
          return String(text).replace(/\%VERSION\%/mg, version);
        };
      } ]);

  OPrime.debug("Defining ActivityFeedFilters.");

  return ActivityFeedFilters;
});