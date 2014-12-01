'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetPagination
 * @description
 * # spreadsheetPagination
 */
angular.module('spreadsheetApp').directive('spreadsheetPagination', function() {
  return {
    templateUrl: 'views/pagination.html',
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
