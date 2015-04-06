"use strict";

angular.module("fielddbAngular").directive("fielddbOfflineControls", function() {
  return {
    templateUrl: "collection/connection/offline-controls.html",
    restrict: "A",
    transclude: false,
    scope: {
      connection: "=json"
    },
    link: function postLink() {
    }
  };
});
