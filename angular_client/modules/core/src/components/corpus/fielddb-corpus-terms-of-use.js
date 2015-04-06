"use strict";

angular.module("fielddbAngularApp").directive("fielddbCorpusTermsOfUse", function() {
  return {
    templateUrl: "views/terms-of-use.html",
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
