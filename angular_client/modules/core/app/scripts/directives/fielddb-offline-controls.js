'use strict';

angular.module('fielddbAngularApp').directive('fielddbOfflineControls', function() {
  return {
    templateUrl: 'views/offline-controls.html',
    restrict: 'A',
    transclude: false,
    scope: {
      json: '=json'
    },
    link: function postLink(scope, element, attrs) {
      // element.text('this is the fielddbOfflineControls directive');
    }
  };
});
'use strict';
