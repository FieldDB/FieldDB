'use strict';

angular.module('fielddbAngularApp').directive('corpus', function() {

  var corpus = {};

  var directiveDefinitionObject = {
    templateUrl: 'views/corpus.html', // or // function(tElement, tAttrs) { ... },
    restrict: 'A',
    transclude: true,
    scope: {
      data: '=json'
    },
    // controller: function($scope, $element, $attrs, $transclude, otherInjectables) {
    // controller: function($scope, $element, $attrs, $transclude) {
    //   console.log('in controller');
    //   console.log($element.html());
    // },
    link: function postLink(scope, element) {
      console.log('in the link function', element);
      for (var information in scope.data) {
        if (scope.data.hasOwnProperty(information)) {
          corpus[information] = scope.data[information];
        }
      }
      scope.corpus = corpus;
      // element.text('this is the corpus directive');
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
