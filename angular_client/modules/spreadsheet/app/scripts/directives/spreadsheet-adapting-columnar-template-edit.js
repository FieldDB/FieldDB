'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetAdaptingColumnarTemplateEdit
 * @description
 * # spreadsheetAdaptingColumnarTemplateEdit
 */
angular.module('spreadsheetApp').directive('spreadsheetAdaptingColumnarTemplateEdit', function() {
  return {
    templateUrl: 'views/adapting-columnar-template-edit.html',
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
