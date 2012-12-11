'use strict';

/* Controllers */

function MyCtrl1($scope, $resource, MostRecentActivities, GetSessionToken) {
	console.log("Loading MyCtrl1");
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

MyCtrl1.$inject = ['$scope', '$resource', 'MostRecentActivities', 'GetSessionToken'];

function MyCtrl2($scope, $resource, MostRecentActivities, GetSessionToken) {
	console.log("Loading MyCtrl2");

  GetSessionToken.run({
    "name" : "publicuser",
    "password" : "none"
  }).then(function() {
    MostRecentActivities.async().then(function(activities) {
      $scope.activities = activities;
    });
  });

}
MyCtrl2.$inject = ['$scope', '$resource', 'MostRecentActivities', 'GetSessionToken'];
