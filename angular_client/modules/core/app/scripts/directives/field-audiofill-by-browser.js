'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fieldAudiofillByBrowser
 * @description
 *
 * http://stackoverflow.com/questions/14965968/angularjs-browser-autofill-workaround-by-using-a-directive
 *
 * # fieldAudiofillByBrowser
*/
angular.module('fielddbAngularApp').directive('fieldAudiofillByBrowser', function() {
  return {
    require: "ngModel",
    link: function(scope, element, attrs, ngModel) {
      scope.$on("fieldAudiofillByBrowser:update", function() {
        ngModel.$setViewValue(element.val());
    });
    }
  }
});
