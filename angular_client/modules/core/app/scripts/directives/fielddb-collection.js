'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbCollection
 * @description
 * # fielddbCollection
 */
angular.module('fielddbAngularApp')
  .directive('fielddbCollection', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the fielddbCollection directive');
      }
    };
  });
