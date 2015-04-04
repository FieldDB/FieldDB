'use strict';
console.log("Declaring the SpreadsheetStyleDataEntryFilters.");

angular.module('spreadsheetApp')
  .filter('neverEmpty', function() {
    return function(input) {
      if (input === "" || input === undefined || input === " ") {
        return "--";
      } else {
        return input;
      }
    };
  });
