'use strict';
console.log("Loading OPrime.filters");

angular.module('OPrime.filters', []).filter('checkmark', function() {
  return function(input) {
    return input ? '\u2713' : '\u2718';
  };
}).filter('agodate', function() {
  return function(input) {
    return OPrime.prettyDate(input);
  };
});
