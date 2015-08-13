"use strict";

/**
 * @ngdoc filter
 * @name fielddbAngular.filter:fielddbPrettyDate
 * @function
 * @description Converts any date format (json format, timestamp etc) into something nicer (for the locale, with hour and minutes)
 * # fielddbPrettyDate
 * Filter in the fielddbAngular.
 */
angular.module("fielddbAngular").filter("fielddbPrettyDate", function() {
  return function(input) {
    if (!input) {
      return "--";
    }
    if (input.replace) {
      input = input.replace(/\"/g, "");
    }
    if (input.trim) {
      input = input.trim();
    }
    if (!input) {
      return "--";
    }
    // For unknown historical reasons in the spreadsheet app
    // there were some dates that were unknown and were set
    // to a random? date like this:
    if (input === "2000-09-06T16:31:30.988Z" || (input >= new Date("2000-09-06T16:31:30.000Z") && input <= new Date("2000-09-06T16:31:31.000Z"))) {
      return "N/A";
    }
    if (!input.toLocaleDateString) {
      input = new Date(input);
    }
    var minutes = input.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    return input.toLocaleDateString() + " " + input.getHours() + ":" + minutes;
  };
});
