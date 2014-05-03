'use strict';

angular.module('fielddbAngularApp').directive('fielddbCorpusTermsOfUse', function() {
  var corpus = {};
  return {
    templateUrl: 'views/terms-of-use.html',
    restrict: 'A',
    transclude: false,
    scope: {
      data: '=json'
    },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink(scope, element, attrs) {
      console.log(attrs);
      for (var information in scope.data) {
        if (scope.data.hasOwnProperty(information)) {
          corpus[information] = scope.data[information];
        }
      }
      scope.corpus = corpus;
      // element.text('this is the corpus directive');
    }
  };
});
