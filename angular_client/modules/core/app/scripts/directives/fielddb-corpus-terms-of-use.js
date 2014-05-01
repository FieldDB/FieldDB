'use strict';

angular.module('fieldDB').directive('fielddbCorpusTermsOfUse', function() {
	var corpus = {}
	corpus.title = "Community Corpus";
	corpus.termsOfUse = {
		"humanReadable": "Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
	};
	corpus.license = {
		"title": "Default: Creative Commons Attribution-ShareAlike (CC BY-SA).",
		"humanReadable": "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
		"link": "http://creativecommons.org/licenses/by-sa/3.0/",
		"imgURL": "//i.creativecommons.org/l/by-sa/3.0/88x31.png"
	};
	corpus.copyright = "Default: Add names of the copyright holders of the corpus."
	return {
		templateUrl: 'views/terms-of-use.html',
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
