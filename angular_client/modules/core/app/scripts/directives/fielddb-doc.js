'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDoc
 * @description
 * # fielddbDoc
 */
angular.module('fielddbAngularApp').directive('fielddbDoc', function() {
  return {
    template: '<div data-fielddb-user json="doc"></div>',
    restrict: 'A',
    transclude: false,
    scope: {
      doc: '=json'
    },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {}
  };
});
