console.log("Loading the LingSyncSpreadsheetFilters.");

'use strict';
define([ "angular" ], function(angular) {
  var LingSyncSpreadsheetFilters = angular.module(
      'LingSyncSpreadsheet.filters', []).filter('startFrom', function() {
    return function(input, start) {
      if (input == undefined) {
        return;
      } else {
        start = +start; // parse to int
        return input.slice(start);
      }
    };
  }).filter('standardDate', function() {
    return function(input) {
      console.log(input);
      if (!input) {
        return "--";
      } else if (input == "TODO") {
        return input;
      } else {
        var newDate = input.replace(/\"/g, "");
        var d = new Date(newDate);
        var t = new Date(newDate);
        return d.toLocaleDateString() + " " + t.toLocaleTimeString();
      }
    };
  }).filter('shortDate', function() {
    return function(input) {
      if (!input) {
        return "--";
      } else if (input == "TODO") {
        return input;
      } else {
        var newDate = input.replace(/\"/g, "");
        var d = new Date(newDate);
        return d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
      }
    };
  }).filter('neverEmpty', function() {
    return function(input) {
      if (input == "" || input == undefined || input == " ") {
        return "--";
      } else {
        return input;
      }
    };
  });
  return LingSyncSpreadsheetFilters;
});