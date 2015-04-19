'use strict';
console.log("Declaring the SpreadsheetStyleDataEntryFilters.");

angular.module('spreadsheetApp')
  .filter('startFrom', function() {
    return function(input, start) {
      if (input === undefined) {
        return;
      } else {
        start = +start; // parse to int
        return input.slice(start);
      }
    };
  })
  .filter('standardDate', function() {
    return function(input) {
      if (!input) {
        return "--";
      } else if (input === "2000-09-06T16:31:30.988Z") {
        return "N/A";
      } else {
        if (typeof input.replace === "function") {
          input = input.replace(/\"/g, "");
        }
        var d = new Date(input);
        var t = new Date(input);
        var minutes = t.getMinutes();
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        return d.toLocaleDateString() + " " + t.getHours() + ":" + minutes;
      }
    };
  })
  .filter('standardDateFromTimestamp', function() {
    return function(input) {
      if (!input) {
        return "--";
      } else if (input === "2000-09-06T16:31:30.988Z") {
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
  })
  .filter('shortDate', function() {
    return function(input) {
      if (!input) {
        return "--";
      } else if (input === "2000-09-06T16:31:30.988Z") {
        return "N/A";
      } else {
        if (typeof input.replace === "function") {
          input = input.replace(/\"/g, "");
        }
        var d = new Date(input);
        return d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
      }
    };
  })
  .filter('neverEmpty', function() {
    return function(input) {
      if (input === "" || input === undefined || input === " ") {
        return "--";
      } else {
        return input;
      }
    };
  })
  .filter('checkDatumTags', function() {
    return function(input) {
      if (input === "Tags") {
        return "--";
      } else {
        return input;
      }
    };
  });
