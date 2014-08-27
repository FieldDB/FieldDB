'use strict';

/**
 * @ngdoc filter
 * @name fielddbAngularApp.filter:fielddbVisiblyEmpty
 * @function
 * @description
 * # fielddbVisiblyEmpty
 * Filter in the fielddbAngularApp.
 */
angular.module('fielddbAngularApp').filter('fielddbVisiblyEmpty', function() {
  return function(input) {
    if (input.trim) {
      input = input.trim();
    }
    if (input === '' || input === undefined || input === null) {
      return '--';
    }
    return input;
  };
});
