'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetAdaptingColumnarTemplateRead
 * @description
 * # spreadsheetAdaptingColumnarTemplateRead
 */
angular.module('spreadsheetApp').directive('spreadsheetAdaptingColumnarTemplateRead', function() {
  return {
    templateUrl: 'views/adapting-columnar-template-read.html',
    restrict: 'A',
    transclude: false,
    // replace: true,
    // scope: {
    //   corpus: '=json'
    // },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {}
  };
});
