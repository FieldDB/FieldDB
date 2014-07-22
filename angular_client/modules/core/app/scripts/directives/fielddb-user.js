'use strict';

angular.module('fielddbAngularApp').directive('fielddbUser', function() {
  return {
    templateUrl: 'views/user.html',
    restrict: 'A',
    transclude: false,
    scope: {
      user: '=json'
    },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {
    }
  };
});
