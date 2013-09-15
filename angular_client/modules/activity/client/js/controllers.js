'use strict';
define(
    [ "angular", "OPrime", "libs/oprime/services/CouchDB" ],
    function(angular, OPrime, CouchDBServices) {
      // Declare app level module which depends on filters, and services

      /**
       * TODO We probably dont need two controllers one for users one for teams,
       * but rather maybe two controllers, once simple feed, one
       * searchable/filtered?
       * 
       * @param $scope
       * @param $resource
       * @param MostRecentActivities
       * @param GetSessionToken
       * @returns
       */
      var ActivityFeedController = function ActivityFeedController($scope,
          $routeParams, $resource, MostRecentActivities, UserDetails, CorpusDetails, GetSessionToken) {
        console.log("Loading ActivityFeedController");
        /*
         * TODO get a corpus item out of the non-activity feed, or out of the
         * activity feed to display this information.
         */
        $scope.corpus = {
          description : "",//"Data gathered during the Field methods class at COLING 2012 when we were working with a Cherokee speaker.",
          gravatar : "user/user_gravatar.png",
          title : "Activity Feed",
          team : {
            username : $routeParams.username
          }
        };

        /*
         * TODO add the corpus connection here so that it can be declared in the
         * route parameters, and passed to the service
         */
        var feedParams = {};
        feedParams.username = $routeParams.username || "lingllama";
        feedParams.corpusid = $routeParams.corpusid;
        if (feedParams.corpusid) {
          /* if the corpus is of this user, then use the user as a component of the corpus, otherwise just use the corpusid  and make the username empty.*/
          if(feedParams.corpusid.indexOf(feedParams.username) > -1){
            feedParams.corpusid = feedParams.corpusid.replace($routeParams.username,"");
          }else{
            feedParams.username = "";
          }
          $scope.corpus.title = "Corpus Activity Feed";
          CorpusDetails.async({username: $routeParams.corpusid.split("-")[0], corpusid: $routeParams.corpusid}).then(function(details) {
            $scope.corpus.gravatar = details.gravatar;
            $scope.corpus.description = details.description;
          });
        }else{
          feedParams.corpusid = "";
          $scope.corpus.title = "User Activity Feed";
          UserDetails.async(feedParams).then(function(details) {
            $scope.corpus.gravatar = details.gravatar;
            $scope.corpus.description = details.description;
          });
        }


//        GetSessionToken.run({
//          "name" : "public",
//          "password" : "none"
//        }).then(function() {
          MostRecentActivities.async(feedParams).then(function(activities) {
            $scope.activities = activities;
          });
//        });

      };

      ActivityFeedController.$inject = [ '$scope', '$routeParams', '$resource',
          'MostRecentActivities', 'UserDetails', 'CorpusDetails', 'GetSessionToken' ];

      OPrime.debug("Defining ActivityFeedController.");

      return ActivityFeedController;
    });
