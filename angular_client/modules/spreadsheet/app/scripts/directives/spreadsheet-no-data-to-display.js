'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetNoDataToDisplay
 * @description
 * # spreadsheetNoDataToDisplay
 */
angular.module('spreadsheetApp').directive('spreadsheetNoDataToDisplay', function() {
  return {
    templateUrl: 'views/spreadsheet-no-data-to-display.html',
    restrict: 'A',
    transclude: false,
    // scope: {
    //   corpus: '=json'
    // },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {
    }
  };
});
