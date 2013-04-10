'use strict';

/* Controllers */

function LingSyncWebsiteMainController($scope, $http) {
	$scope.show_section = 'share';
	if ($scope.activePage == undefined) {
		$scope.activePage = 'home';
	}
};

function LingSyncWebsiteTechnologyController($scope, $http) {
	$scope.show_section = 'principles';
	if ($scope.activePage == undefined) {
		$scope.activePage = 'technology';
	}
};

LingSyncWebsiteMainController.$inject = [ '$scope', '$http' ];
LingSyncWebsiteTechnologyController.$inject = [ '$scope', '$http' ];