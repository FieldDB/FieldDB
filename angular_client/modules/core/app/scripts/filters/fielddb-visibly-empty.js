'use strict';

/**
 * @ngdoc filter
 * @name fielddbAngularApp.filter:fielddbVisiblyEmpty
 * @function
 * @description
 * # fielddbVisiblyEmpty
 * Filter in the fielddbAngularApp.
 */
angular.module('fielddbAngularApp')
  .filter('fielddbVisiblyEmpty', function () {
    return function (input) {
      return 'fielddbVisiblyEmpty filter: ' + input;
    };
  });
