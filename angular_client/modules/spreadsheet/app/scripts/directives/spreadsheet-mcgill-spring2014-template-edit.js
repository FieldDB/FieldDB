'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetMcgillSpring2014TemplateEdit
 * @description
 * # spreadsheetMcgillSpring2014TemplateEdit
 */
angular.module('spreadsheetApp').directive('spreadsheetMcgillSpring2014TemplateEdit', function() {
  return {
    templateUrl: 'views/mcgillfieldmethodsspring2014template-edit.html',
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
