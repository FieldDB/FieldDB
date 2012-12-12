'use strict';
console.log("Loading Activity.services");

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('ActivityFeed.services', [ 'ngResource' ])
.value('version', '0.1')
.factory(
    'MostRecentActivities',
    function($http) {
      return {
        'async' : function() {
          var promise = $http
              .get(
                  'https://ifielddevs.iriscouch.com/lingllama-cherokee-activity_feed/'
                      + '_design/activities/_view/all?limit=20&decending=true').then(
                  function(response) {
                    // + JSON.stringify(response));
                     console.log("response", response);
                    var results = [];
                    for (var i = 0; i < response.data.rows.length; i++) {
                    	results.push(response.data.rows[i].value);
                    }
                     return results;
                  });
          return promise;
        }
      };
    });