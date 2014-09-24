
/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetYale2014TemplateRead
 * @description
 * # spreadsheetYale2014TemplateRead
 */
angular.module('spreadsheetApp').directive('spreadsheetYale2014TemplateRead', function() {
  return {
    templateUrl: 'views/yalefieldmethodsspring2014template-read.html',
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
