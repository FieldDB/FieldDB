'use strict';

angular.module('corpuspagesApp').directive('user', function() {
	return {
		templateUrl: 'views/user.html',
		restrict: 'A',
		link: function postLink(scope, element, attrs) {
			console.log(attrs);
			// element.text('this is the user directive');
		}
	};
});
