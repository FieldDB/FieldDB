'use strict';

angular.module('corpuspagesApp').controller('MainCtrl', function($scope) {
	$scope.awesomeThings = [
		'HTML5 Boilerplate',
		'AngularJS',
		'Karma'
	];
	$scope.team = null;
	$scope.corpus = {
		pouchname: 'glossersample-quechua'
	};
	$scope.corpora = null;
	$scope.thisyear = (new Date()).getFullYear();
});
