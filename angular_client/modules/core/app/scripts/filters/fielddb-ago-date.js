'use strict';

/**
 * @ngdoc filter
 * @name fielddbAngularApp.filter:fielddbAgoDate
 * @function
 * @description
 * # fielddbAgoDate
 * Filter in the fielddbAngularApp.
 */
angular.module('fielddbAngularApp')
  .filter('fielddbAgoDate', function () {
    return function (input) {
      return 'fielddbAgoDate filter: ' + input;
    };
  });
