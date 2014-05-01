'use strict';

angular.module('corpuspagesApp')
	.controller('MainCtrl', function($scope) {
		$scope.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];
		$scope.app = {
			team: null,
			corpus: null,
			corpora: null
		};
		$scope.thisyear = (new Date()).getFullYear();
	});
