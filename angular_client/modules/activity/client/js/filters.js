'use strict';
define([ "angular", "OPrime" ], function(angular, OPrime) {

  /* Filters */

  var ActivityFeedFilters = angular.module('ActivityFeed.filters', []).filter(
      'interpolate', [ 'version', function(version) {
        return function(text) {
          return String(text).replace(/\%VERSION\%/mg, version);
        };
      } ]).filter('gravatar', function(){
        return function(gravatar, scope) {
          return gravatar.replace("https://secure.gravatar.com/avatar/","").replace("?s","");
        };
      });

  OPrime.debug("Defining ActivityFeedFilters.");

  return ActivityFeedFilters;
});