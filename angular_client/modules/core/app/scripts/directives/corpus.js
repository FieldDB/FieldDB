'use strict';

angular.module('fieldDB').directive('corpus', function() {
  var corpus = {};
  corpus.gravatar = 'https://secure.gravatar.com/avatar/948814f0b1bc8bebd701a9732ab3ebbd.jpg?s=96&d=retro&r=pg';
  corpus.title = 'Community Corpus';
  corpus.description = 'This is a corpus which is editable by anyone in the LingSync community. You can add comments to data, import data, leave graffiti and help suggestions for other community members. We think that \'graffiti can give us a unique view into the daily life and customs of a people, for their casual expression encourages the recording of details that more formal writing would tend to ignore\' ref: http://nemingha.hubpages.com/hub/History-of-Graffiti';
  return {
    templateUrl: 'views/corpus.html',
    restrict: 'A',
    transclude: true,
    scope: true,
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink(scope, element, attrs) {
      console.log(attrs);
      scope.corpus = corpus;
      // element.text('this is the corpus directive');
    }
  };
});
