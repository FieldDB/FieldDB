'use strict';

angular.module('fielddbAngularApp').directive('user', function() {
  return {
    templateUrl: 'views/user.html',
    restrict: 'A',
    transclude: false,
    scope: {
      user: '=json'
    },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink(scope, element) {
      // element.text('this is the user directive');
    }
  };
});
