'use strict';

/* Controllers */

function LingSyncWebsiteMainController($scope, $http) {
	$scope.show_section = 'share';
	if ($scope.activePage == undefined) {
		$scope.activePage = 'home';
	}
};

LingSyncWebsiteMainController.$inject = [ '$scope', '$http' ];