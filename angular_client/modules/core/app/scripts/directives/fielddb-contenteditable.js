'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbContenteditable
 * @description
 *
 * Sample to use contenteditable in Angular
 * https://docs.angularjs.org/api/ng/type/ngModel.NgModelController
 *
 *
 * # fielddbContenteditable
 */
angular.module('fielddbAngularApp').directive('fielddbContenteditable', ['$sce',
  function($sce) {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, element, attrs, ngModel) {
        console.log('NGmodel is ', ngModel);
        if (!ngModel) {
          return; // do nothing if no ng-model
        }

        // Specify how UI should be updated
        ngModel.$render = function() {
          element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
        };

        // Write data to the model
        var read = function read() {
          var html = element.html();
          // When we clear the content editable the browser leaves a <br> behind
          // If strip-br attribute is provided then we strip this out
          if (attrs.stripBr && html === '<br>') {
            html = '';
          }
          console.log('html is ', html);
          ngModel.$setViewValue(html);
        };

        // Listen for change events to enable binding
        element.on('blur keyup change', function() {
          scope.$apply(read);
        });
        read(); // initialize

      }
    };
  }
]);
