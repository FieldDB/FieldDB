'use strict';

/* Controllers */

function TeamActivityFeedController($scope, $resource, MostRecentActivities, GetSessionToken) {

  $scope.corpus = {
    description : "Data gathered durring the Field methods class at COLING 2012 when we were working with a Cherokee speaker.",
    gravatar : "https://secure.gravatar.com/avatar/54b53868cb4d555b804125f1a3969e87?s",
    title : "Cherokee Field Methods",
    team : {
      _id : "lingllama"
    }
  };

  GetSessionToken.run({
    "name" : "publicuser",
    "password" : "none"
  }).then(function() {
    MostRecentActivities.async().then(function(activities) {
      $scope.activities = activities;
    });
  });

};

TeamActivityFeedController.$inject = ['$scope', '$resource', 'MostRecentActivities', 'GetSessionToken'];

function UserActivityFeedController($scope, $resource, MostRecentActivities, GetSessionToken) {

  GetSessionToken.run({
    "name" : "publicuser",
    "password" : "none"
  }).then(function() {
    MostRecentActivities.async().then(function(activities) {
      $scope.activities = activities;
    });
  });

}
UserActivityFeedController.$inject = ['$scope', '$resource', 'MostRecentActivities', 'GetSessionToken'];
