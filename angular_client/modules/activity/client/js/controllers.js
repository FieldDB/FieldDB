'use strict';
define(
  ["angular", "OPrime", "libs/oprime/services/CouchDB"],
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
      $routeParams, $resource, MostRecentActivities, UserDetails, CorpusDetails, GetSessionToken, Login, Logout) {
      console.log("Loading ActivityFeedController");

      $scope.loginUser = {
        name: "lingllama",
        password: "phoneme"
      };

      $scope.user = {};

      $scope.login = function(user) {
        Login.run(user)
          .then(function(result) {
            console.log('Got a login response ', result);
            if (result.error) {
              return alert("Sorry" + result.error.data);
            }
            load(result.data.userCtx);
            $scope.mustLogIn = false;
            $scope.$digest();
          });
      };

      $scope.logout = function(user) {
        Logout.run()
          .then(function(result) {
            console.log('Got a logout response ', result);
            if (result.error) {
              return alert("Sorry" + result.error.data);
            }
            $scope.mustLogIn = false;
            $scope.$digest();
          });
      };

      $scope.showChooseCorpus = false;
      $scope.toggleChooseCorpus = function() {
        $scope.showChooseCorpus = !$scope.showChooseCorpus;
      };
      /*
       * TODO get a corpus item out of the non-activity feed, or out of the
       * activity feed to display this information.
       */
      $scope.corpus = {
        description: "", //"Data gathered during the Field methods class at COLING 2012 when we were working with a Cherokee speaker.",
        gravatar: "0df69960706112e38332395a4f2e7542",
        title: "Activity Feed",
        team: {
          username: $routeParams.username
        }
      };

      var load = function(data) {
        var feedParams = {};
        var username = data.name || data.username;

        if (username) {
          if (!$routeParams.username || $routeParams.username === username) {
            $routeParams.username = username;
            // TODO redirect to that user's space
          }
        } else {
          if ($routeParams.username) {
            data = localStorage.getItem($routeParams.username);
            try {
              data = JSON.parse(data);
            } catch (e) {
              console.log('no current user is saved');
            }
          }
        }
        if (data) {
          if (data.name) {
            $scope.user.username = data.name;
            $scope.user.corpora = data.roles.map(function(role) {
              return {
                dbname: role,
                title: role,
                titleAsUrl: role
              };
            });
          } else {
            $scope.user.username = data.username;
            $scope.user.corpora = data.corpora;
          }
        }

        feedParams.username = $routeParams.username;
        feedParams.corpusid = $routeParams.corpusid;

        if (feedParams.corpusid) {
          /* if the corpus is of this user, then use the user as a component of the corpus, otherwise just use the corpusid  and make the username empty.*/
          if (feedParams.corpusid.indexOf(feedParams.username) > -1) {
            feedParams.corpusid = feedParams.corpusid.replace($routeParams.username, "");
          } else {
            feedParams.username = "";
          }
          $scope.corpus.title = "What's happening in this corpus";
          CorpusDetails.async({
            username: $routeParams.corpusid.split("-")[0],
            corpusid: $routeParams.corpusid
          }).then(function(details) {
            $scope.corpus.gravatar = details.gravatar;
            $scope.corpus.description = details.description;
          });
        } else {
          feedParams.corpusid = "";
          $scope.corpus.title = "What was I working on last time...";
          UserDetails.async(feedParams).then(function(details) {
            $scope.corpus.gravatar = details.gravatar;
            $scope.corpus.description = details.description;
          });
        }

        MostRecentActivities.async(feedParams).then(function(activities) {
          if (activities.error) {
            if (activities.error.status === 401) {
              $scope.mustLogIn = true;
            }
            return;
          }
          $scope.activities = activities;
        });
      }

      GetSessionToken.run({
        "name": "public",
        "password": "none"
      }).then(function(result) {
        if (result.error) {
          if (result.error.status === 401) {
            $scope.mustLogIn = true;
          } else {
            alert("Unable to contact the server, please try again. " + result.error.status);
          }
          return;
        } else {
          if (!result.name) {
            $scope.mustLogIn = true;
            return;
          }
        }

        load(result);
      });

    };

    ActivityFeedController.$inject = ['$scope', '$routeParams', '$resource',
      'MostRecentActivities', 'UserDetails', 'CorpusDetails', 'GetSessionToken', 'Login', 'Logout'
    ];

    OPrime.debug("Defining ActivityFeedController.");

    return ActivityFeedController;
  });
