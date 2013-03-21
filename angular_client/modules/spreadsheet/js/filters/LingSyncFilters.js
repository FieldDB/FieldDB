console.log("Loading the LingSyncFilters.");

'use strict';
define([ "angular" ], function(angular) {
	var LingSyncFilters = angular.module('LingSync.filters', []).filter('startFrom',
      function() {
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
      var newDate = input.replace(/\"/g,"");
      var d = new Date(newDate);
      var t = new Date(newDate);
      return d.toLocaleDateString() + " " + t.toLocaleTimeString();
    };
  }).filter('shortDate', function() {
    return function(input) {
      var newDate = input.replace(/\"/g,"");
      var d = new Date(newDate);
      return d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear();
    };
  }).filter('neverEmpty', function() {
    return function(input) {
      if (input == "" || input == undefined || input == " ") {
        return "--";
      }
      else {
        return input;
      }
    };
  });
	return LingSyncFilters;
});