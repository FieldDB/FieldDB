'use strict';

/**
 * @ngdoc filter
 * @name fielddbAngularApp.filter:fielddbShortDate
 * @function
 * @description
 * # fielddbShortDate
 * Filter in the fielddbAngularApp.
 */
angular.module('fielddbAngularApp')
  .filter('fielddbShortDate', function () {
    return function (input) {
      return 'fielddbShortDate filter: ' + input;
    };
  });
