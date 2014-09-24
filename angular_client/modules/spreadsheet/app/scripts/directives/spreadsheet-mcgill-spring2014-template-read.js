'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetMcgillSpring2014TemplateRead
 * @description
 * # spreadsheetMcgillSpring2014TemplateRead
 */
angular.module('spreadsheetApp').directive('spreadsheetMcgillSpring2014TemplateRead', function() {
  return {
    templateUrl: 'views/mcgillfieldmethodsspring2014template-read.html',
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
