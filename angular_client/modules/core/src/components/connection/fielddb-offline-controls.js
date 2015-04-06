"use strict";

angular.module("fielddbAngularApp").directive("fielddbOfflineControls", function() {
  return {
    templateUrl: "views/offline-controls.html",
    restrict: "A",
    transclude: false,
    scope: {
      connection: "=json"
    },
    link: function postLink() {
    }
  };
});
