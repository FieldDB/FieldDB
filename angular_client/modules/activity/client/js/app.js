'use strict';
define([ "angular", "OPrime", "js/controllers" ], function(angular, OPrime,
    ActivityFeedController) {
  // Declare app level module which depends on filters, and services
  var ActivityFeed = angular.module(
      'ActivityFeed',
      [ 'ActivityFeed.filters', 'ActivityFeed.services',
          'ActivityFeed.directives', 'CouchDBServices', 'OPrime.filters' ])
      .config([ '$routeProvider', function($routeProvider) {
        OPrime.debug("Defining routes.");

        $routeProvider.when('/user/:username/corpus/:corpusid', {
          templateUrl : 'partials/activity_feed_widget.html',
          controller : ActivityFeedController
        });
        $routeProvider.otherwise({
          redirectTo : '/user/gina/corpus/urdu'
        });
      } ]);

  OPrime.debug("Defining ActivityFeed.");

  return ActivityFeed;
});
