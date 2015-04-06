"use strict";

/**
 * @ngdoc filter
 * @name fielddbAngular.filter:fielddbVisiblyEmpty
 * @function
 * @description
 * # fielddbVisiblyEmpty
 * Filter in the fielddbAngular.
 */
angular.module("fielddbAngular").filter("fielddbVisiblyEmpty", function() {
  return function(input) {
    if (input.trim) {
      input = input.trim();
    }
    if (input === "" || input === undefined || input === null) {
      return "--";
    }
    return input;
  };
});
