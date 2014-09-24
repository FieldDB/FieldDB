'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetAdaptingColumnarTemplateNew
 * @description
 * # spreadsheetAdaptingColumnarTemplateNew
 */
angular.module('spreadsheetApp').directive('spreadsheetAdaptingColumnarTemplateNew', function() {
  return {
    templateUrl: 'views/adapting-columnar-template-new.html',
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
