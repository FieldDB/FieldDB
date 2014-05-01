'use strict';

angular.module('fielddbAngularApp').directive('corpus', function() {

  var corpus = {};
  corpus.gravatar = 'https://secure.gravatar.com/avatar/948814f0b1bc8bebd701a9732ab3ebbd.jpg?s=96&d=retro&r=pg';
  corpus.title = 'Community Corpus';
  corpus.description = 'This is a corpus which is editable by anyone in the LingSync community. You can add comments to data, import data, leave graffiti and help suggestions for other community members. We think that \'graffiti can give us a unique view into the daily life and customs of a people, for their casual expression encourages the recording of details that more formal writing would tend to ignore\' ref: http://nemingha.hubpages.com/hub/History-of-Graffiti';

  var directiveDefinitionObject = {
    templateUrl: 'views/corpus.html', // or // function(tElement, tAttrs) { ... },
    restrict: 'E',
    transclude: false,
    scope: false,
    // controller: function($scope, $element, $attrs, $transclude, otherInjectables) {
    controller: function($scope, $element, $attrs, $transclude) {
      console.log("in controller");
      console.log($element.html());
    },
    link: function postLink(scope, element) {
      console.log('in the link function');
      element.text('this is the corpus directive');
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
