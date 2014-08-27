'use strict';

/**
 * @ngdoc filter
 * @name fielddbAngularApp.filter:fielddbPrettyDate
 * @function
 * @description Converts any date format (json format, timestamp etc) into something nicer (for the locale, with hour and minutes)
 * # fielddbPrettyDate
 * Filter in the fielddbAngularApp.
 */
angular.module('fielddbAngularApp').filter('fielddbPrettyDate', function() {
  return function(input) {
    if (!input) {
      return "--";
    } else if (input == "2000-09-06T16:31:30.988Z") {
      return "N/A";
    } else {
      var newDate = input.replace(/\"/g, "");
      var d = new Date(newDate);
      var t = new Date(newDate);
      var minutes = t.getMinutes();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      return d.toLocaleDateString() + " " + t.getHours() + ":" + minutes;
    }
  };
}).filter('standardDateFromTimestamp', function() {
  return function(input) {
    if (!input) {
      return "--";
    } else if (input == "2000-09-06T16:31:30.988Z") {
      return "N/A";
    } else {
      var newDate = input;
      var d = new Date(newDate);
      var t = new Date(newDate);
      var minutes = t.getMinutes();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      return d.toLocaleDateString() + " " + t.getHours() + ":" + minutes;
    }
  };
});
