'use strict';

angular.module('corpuspagesApp').directive('corpus', function() {
	var corpus = {}
	corpus.gravatar = "https://secure.gravatar.com/avatar/948814f0b1bc8bebd701a9732ab3ebbd.jpg?s=96&d=retro&r=pg"
	corpus.title = "Community Corpus";
	corpus.description = "blah blah";
	return {
		templateUrl: 'views/corpus.html',
		restrict: 'A',
		transclude: true,
		scope: true,
		controller: function($scope, $element, $attrs, $transclude) {},
		link: function postLink(scope, element, attrs) {
			console.log(attrs);
			scope.corpus = corpus;
			// element.text('this is the corpus directive');
		}
	};
});
