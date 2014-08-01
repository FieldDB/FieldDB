'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbParticipants
 * @description
 * # fielddbParticipants
 */
angular.module('fielddbAngularApp').directive('fielddbParticipants', function() {

  var directiveDefinitionObject = {
    templateUrl: 'views/participants.html', // or // function(tElement, tAttrs) { ... },
    restrict: 'A',
    transclude: false,
    scope: {
      participants: '=json'
    },
    link: function postLink() {
    },
    priority: 0,
    replace: false,
    controllerAs: 'stringAlias'
  };
  return directiveDefinitionObject;
});
