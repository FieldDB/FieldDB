"use strict";

angular.module("fielddbAngular").directive("fielddbCorpusTermsOfUse", function() {
  return {
    templateUrl: "collection/corpus/terms-of-use.html",
    restrict: "A",
    transclude: false,
    scope: {
      corpus: "=json"
    },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {
    }
  };
});
