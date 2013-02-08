'use strict';
define([ "angular", "OPrime", "libs/oprime/services/CouchDB" ], function(
    angular, OPrime, CouchDBServices) {

  console.log("Loading Activity.services");

  /* Services */

  /*
   * TODO requires a view to users' activity feeds so that these can be generated,
   * and add a check box so they user can make their feed public. if they check
   * it, either add the publicuser to the activity feed database security
   */
  var ActivityFeedServices = angular.module('ActivityFeed.services',
      [ 'ngResource' ]).value('version', '0.1').factory(
      'MostRecentActivities',
      function($http) {
        return {
          'async' : function(params) {
            console.log("Fetching this activity feed: ", params);
            var location = OPrime.couchURL();
            var promise = $http.get(
                location.protocol + location.domain + location.port + '/'
                    + params.username + params.corpusid + '-activity_feed/'
                    + '_design/activities/_view/activities?limit=20&decending=true')
                .then(function(response) {
                  // + JSON.stringify(response));
                  // console.log("response", response);
                  var results = [];
                  for ( var i = 0; i < response.data.rows.length; i++) {
                    results.push(response.data.rows[i].value);
                  }
                  return results;
                });
            return promise;
          }
        };
      });

  return ActivityFeedServices;

});