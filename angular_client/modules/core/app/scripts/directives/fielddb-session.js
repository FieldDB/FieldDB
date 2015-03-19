'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbSession
 * @description
 * # fielddbSession
 */
angular.module('fielddbAngularApp')
  .directive('fielddbSession', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the fielddbSession directive');
      }
    };
  });
