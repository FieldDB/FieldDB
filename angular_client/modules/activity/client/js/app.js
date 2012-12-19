'use strict';
define([ "angular", "OPrime", "js/controllers" ], function(angular, OPrime,
    TeamActivityFeedController) {
  // Declare app level module which depends on filters, and services
  var ActivityFeed = angular.module(
      'ActivityFeed',
      [ 'ActivityFeed.filters', 'ActivityFeed.services',
          'ActivityFeed.directives', 'CouchDBServices', 'OPrime.filters' ])
      .config([ '$routeProvider', function($routeProvider) {
        OPrime.debug("Defining routes.");

        $routeProvider.when('/view1', {
          templateUrl : 'partials/partial1.html',
          controller : TeamActivityFeedController
        });
        $routeProvider.otherwise({
          redirectTo : '/view1'
        });
      } ]);

  OPrime.debug("Defining ActivityFeed.");

  return ActivityFeed;
});
