"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDatumField
 * @description
 * # fielddbDatumField
 */

angular.module("fielddbAngularApp").directive("fielddbDatumField", function() {

  var directiveDefinitionObject = {
    templateUrl: "views/datum-field.html", // or // function(tElement, tAttrs) { ... },
    restrict: "A",
    transclude: false,
    scope: {
      datumField: "=json"
    },
    // controller: function($scope, $element, $attrs, $transclude, otherInjectables) {
    // controller: function($scope, $element, $attrs, $transclude) {
    //   console.log("in controller");
    //   console.log($element.html());
    // },
    link: function postLink(scope) {
      console.log("linking datumfield", scope.datumField, scope.contextualizer);
      scope.contextualize = scope.$root.contextualize;
    },
    priority: 0,
    replace: false,
    controllerAs: "stringAlias"
    // require: "siblingDirectiveName", // or // ["^parentDirectiveName", "?optionalDirectiveName", "?^optionalParent"],
    // compile: function compile(tElement, tAttrs, transclude) {
    //   return {
    //     pre: function preLink(scope, iElement, iAttrs, controller) {
    //       console.log("in preLink");
    //     },
    //     post: function postLink(scope, iElement, iAttrs, controller) {
    //       console.log("in postLink");
    //       console.log(iElement.html());
    //       iElement.text("this is the datumField directive");
    //     }
    //   }
    //   // or
    //   // return function postLink( ... ) { ... }
    // }
  };
  return directiveDefinitionObject;
});
