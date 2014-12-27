'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDatumField
 * @description
 * # fielddbDatumField
 */
angular.module('fielddbAngularApp')
  .directive('fielddbDatumField', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the fielddbDatumField directive');
      }
    };
  });
