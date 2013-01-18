console.log("Loading OPrime.filters");
'use strict';

define([ "angular", "OPrime" ], function(angular, OPrime) {

  var OPrimeFilters = angular.module('OPrime.filters', []).filter('checkmark',
      function() {
        return function(input) {
          return input ? '\u2713' : '\u2718';
        };
      }).filter('agoDate', function() {
    return function(input) {
      return OPrime.prettyTimestamp(input);
    };
  }).filter('localizedDate', function() {
    return function(input) {
      return (new Date(input)).toString();
    };
  });

  return OPrimeFilters;
});