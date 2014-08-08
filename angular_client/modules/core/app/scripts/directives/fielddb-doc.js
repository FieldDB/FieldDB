'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDoc
 * @description
 * # fielddbDoc
 */
angular.module('fielddbAngularApp')
  .directive('fielddbDoc', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the fielddbDoc directive');
      }
    };
  });
