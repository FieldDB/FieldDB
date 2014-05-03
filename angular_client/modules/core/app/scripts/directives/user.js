'use strict';

angular.module('fielddbAngularApp').directive('user', function() {
  var user = {};
  return {
    templateUrl: 'views/user.html',
    restrict: 'A',
    transclude: false,
    scope: {
      data: '=json'
    },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink(scope, element, attrs) {
      for (var information in scope.data) {
        if (scope.data.hasOwnProperty(information)) {
          user[information] = scope.data[information];
        }
      }
      scope.user = user;
      console.log(attrs);
      // element.text('this is the user directive');
    }
  };
});
