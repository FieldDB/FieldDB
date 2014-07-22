'use strict';

angular.module('fielddbAngularApp').directive('fielddbCorpus', function($timeout) {

  var directiveDefinitionObject = {
    templateUrl: 'views/corpus.html', // or // function(tElement, tAttrs) { ... },
    restrict: 'A',
    transclude: false,
    scope: {
      corpus: '=json'
    },
    // controller: function($scope, $element, $attrs, $transclude, otherInjectables) {
    // controller: function($scope, $element, $attrs, $transclude) {
    //   console.log('in controller');
    //   console.log($element.html());
    // },
    link: function postLink(scope, element) {
      // console.log('in the link function', element);
    },
    priority: 0,
    replace: false,
    controllerAs: 'stringAlias'
    // require: 'siblingDirectiveName', // or // ['^parentDirectiveName', '?optionalDirectiveName', '?^optionalParent'],
    // compile: function compile(tElement, tAttrs, transclude) {
    //   return {
    //     pre: function preLink(scope, iElement, iAttrs, controller) {
    //       console.log("in preLink");
    //     },
    //     post: function postLink(scope, iElement, iAttrs, controller) {
    //       console.log("in postLink");
    //       console.log(iElement.html());
    //       iElement.text('this is the corpus directive');
    //     }
    //   }
    //   // or
    //   // return function postLink( ... ) { ... }
    // }
  };
  return directiveDefinitionObject;
});
