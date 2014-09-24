'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetMcgillSpring2014TemplateNew
 * @description
 * # spreadsheetMcgillSpring2014TemplateNew
 */
angular.module('spreadsheetApp').directive('spreadsheetMcgillSpring2014TemplateNew', function() {
  return {
    templateUrl: 'views/mcgillfieldmethodsspring2014template-new.html',
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
