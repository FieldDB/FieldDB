console.log("Loading the Activity Feed Main");

// Set the RequireJS configuration
require.config({
  paths : {
    "angular" : "libs/angular/angular",
    "angular-resource" : "libs/angular/angular-resource",
    "OPrime" : "libs/oprime/OPrime",
    "webservicesconfig" : "js/couch_constants"
  },
  shim : {
    "angular" : {
      exports : "angular"
    },

    "angular-resource" : {
      deps : [ "angular" ],
      exports : "angular"
    },

    "OPrime" : {
      exports : "OPrime"
    },

    "webservicesconfig" : {
      deps : [ "OPrime" ],
      exports : "OPrime"
    }

  }
});

// Initialization
require([ "js/app", "js/controllers", "js/filters", "js/services",
    "js/directives", "libs/oprime/services/CouchDB", "libs/oprime/filters/OPrimeFilters", "angular-resource",
    "webservicesconfig" ], function(ActivityFeed, TeamActivityFeedController,
    ActivityFeedFilters, ActivityFeedServices, ActivityFeedDirectives,
    CouchDBServices, OPrimeFilters, angular, OPrime) {
  OPrime.debug("Initializing the activity feed module.");

  angular.bootstrap(document, [ 'ActivityFeed' ]);

});