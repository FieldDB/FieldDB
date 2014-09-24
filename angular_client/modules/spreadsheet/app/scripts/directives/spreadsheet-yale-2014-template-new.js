
/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetYale2014TemplateNew
 * @description
 * # spreadsheetYale2014TemplateNew
 */
angular.module('spreadsheetApp').directive('spreadsheetYale2014TemplateNew', function() {
  return {
    templateUrl: 'views/yalefieldmethodsspring2014template-new.html',
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
