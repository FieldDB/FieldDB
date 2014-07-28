'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbImport
 * @description
 * # fielddbImport
 */
angular.module('fielddbAngularApp').directive('fielddbImport', function() {

  var directiveDefinitionObject = {
    templateUrl: 'views/import.html',
    restrict: 'A',
    transclude: false,
    scope: {
      importDetails: '=json'
    },
    link: function postLink() {
    },
    priority: 0,
    replace: false,
    controllerAs: 'stringAlias'
  };
  return directiveDefinitionObject;
});
