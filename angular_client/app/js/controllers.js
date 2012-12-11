'use strict';

/* Controllers */

function MyCtrl1($scope, $resource, MostRecentActivities, GetSessionToken) {

	GetSessionToken.run({
		"name" : "publicuser",
		"password" : "none"
	}).then(function() {
		MostRecentActivities.async().then(function(activities) {
			$scope.activities = activities;
		});
	});

};

// MyCtrl1.$inject = [];

function MyCtrl2($scope, $resource, MostRecentActivities, GetSessionToken) {

	GetSessionToken.run({
		"name" : "publicuser",
		"password" : "none"
	}).then(function() {
		MostRecentActivities.async().then(function(activities) {
			$scope.activities = activities;
		});
	});

}
// MyCtrl2.$inject = [];
