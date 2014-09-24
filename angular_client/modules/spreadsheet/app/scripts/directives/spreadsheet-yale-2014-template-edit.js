/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetYale2014TemplateEdit
 * @description
 * # spreadsheetYale2014TemplateEdit
 */
angular.module('spreadsheetApp').directive('spreadsheetYale2014TemplateEdit', function() {
  return {
    templateUrl: 'views/yalefieldmethodsspring2014template-edit.html',
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
