'use strict';

/**
 * @ngdoc filter
 * @name fielddbAngularApp.filter:fielddbShortDate
 * @function
 * @description
 * # fielddbShortDate
 * Filter in the fielddbAngularApp.
 */
angular.module('fielddbAngularApp').filter('fielddbShortDate', function() {
  return function(input) {
    if (!input) {
      return '--';
    }
    if (input.replace) {
      input = input.replace(/\"/g, '');
    }
    if (input.trim) {
      input = input.trim();
    }
    if (!input) {
      return '--';
    }
    // For unknown historical reasons in the spreadsheet app
    // there were some dates that were unknown and were set
    // to a random? date like this:
    if (input === '2000-09-06T16:31:30.988Z' || (input >= new Date('2000-09-06T16:31:30.000Z') && input <= new Date('2000-09-06T16:31:31.000Z'))) {
      return 'N/A';
    }
    if (!input.toLocaleDateString) {
      input = new Date(input);
    }
    return input.toLocaleDateString();
  };
});
