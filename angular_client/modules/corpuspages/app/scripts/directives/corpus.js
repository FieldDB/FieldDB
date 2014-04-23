'use strict';

angular.module('corpuspagesApp').directive('corpus', function() {
	return {
		templateUrl: 'views/corpus.html',
		restrict: 'A',
		link: function postLink(scope, element, attrs) {
			console.log(attrs);
			// element.text('this is the corpus directive');
		}
	};
});
