"use strict";
/* globals FieldDB */


/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbLocales
 * @description
 * # fielddbLocales
 */
angular.module("fielddbAngular").directive("fielddbLocales", function() {
  var debugMode = false;
  var controller = function($scope, $timeout) {

    /**
     * Error: 10 $digest() iterations reached. Aborting!
     * http://stackoverflow.com/questions/14376879/error-10-digest-iterations-reached-aborting-with-dynamic-sortby-predicate
     */
    $timeout(function() {
      if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application && FieldDB.FieldDBObject.application.contextualizer) {
        debugMode = FieldDB.FieldDBObject.application.contextualizer.debugMode;
        $scope.locales = FieldDB.FieldDBObject.application.contextualizer;
      } else {
        console.warn("locales is not available on the scope. ");
      }
    }, 1000);

    $scope.persistUsersChosenLocale = function(currentLocale) {
      $scope.locales.userOverridenLocalePreference = currentLocale;
    };

    $scope.clearLocalizerUserPreferences = function() {
      $scope.locales.userOverridenLocalePreference = null;
    };

  };
  controller.$inject = ["$scope", "$timeout"];

  /* Directive declaration */
  var directiveDefinitionObject = {
    templateUrl: "app/components/locales/locales.html", // or // function(tElement, tAttrs) { ... },
    restrict: "A",
    transclude: false,
    // scope: {
    //   locales: "=json"
    // },
    controller: controller,
    link: function postLink(scope, element, attrs) {
      if (debugMode) {
        console.log("linking locales directive", scope, element, attrs);
      }
      if (attrs.fielddbFullView) {
        scope.showFullView = true;
        scope.localeKeyToShow = "nativeName";
      }
      if (attrs.fielddbShowLocaleKey) {
        scope.localeKeyToShow = attrs.fielddbShowLocaleKey;
      } else {
        scope.localeKeyToShow = "iso";
      }

    },
    priority: 0,
    // replace: true,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});
