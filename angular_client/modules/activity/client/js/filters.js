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
          if(!gravatar){
            return "0df69960706112e38332395a4f2e7542";
          }
          return gravatar.replace("https://secure.gravatar.com/avatar/","").replace("?s","").replace(/\//g,"").replace("userpublic_gravatar.png","968b8e7fb72b5ffe2915256c28a9414c");
        };
      });

  OPrime.debug("Defining ActivityFeedFilters.");

  return ActivityFeedFilters;
});
