"use strict";

angular.module("fielddbAngularApp").directive("fielddbSearch", function() {
  var search = {};
  search.sortBy = "dateCreated";
  search.fields = ["utterance", "translation"];
  return {
    templateUrl: "views/search.html",
    restrict: "A",
    transclude: false,
    scope: true,
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink(scope, element, attrs) {
      console.log(attrs);
      scope.search = search;
      // element.text("this is the search directive");
    }
  };
});
