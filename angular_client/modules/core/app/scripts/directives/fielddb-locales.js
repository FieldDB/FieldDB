"use strict";
/* globals FieldDB */


/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbLocales
 * @description
 * # fielddbLocales
 */
angular.module("fielddbAngularApp").directive("fielddbLocales", function() {

  var controller = function($scope, $timeout) {

    /**
     * Error: 10 $digest() iterations reached. Aborting!
     * @type {[type]}
     * http://stackoverflow.com/questions/14376879/error-10-digest-iterations-reached-aborting-with-dynamic-sortby-predicate
     */
    $timeout(function() {
      if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application && FieldDB.FieldDBObject.application.contextualizer) {
        $scope.locales = FieldDB.FieldDBObject.application.contextualizer;
      } else {
        console.warn("locales is not available on the scope. ");
      }
    }, 1000);

    $scope.persistUsersChosenLocale = function(currentLocale) {
      $scope.locales.userOverridenLocalePreference = currentLocale;
    };

  };
  controller.$inject = ["$scope", "$timeout"];

  /* Directive declaration */
  var directiveDefinitionObject = {
    templateUrl: "views/locales.html", // or // function(tElement, tAttrs) { ... },
    restrict: "A",
    transclude: false,
    // scope: {
    //   locales: "=json"
    // },
    controller: controller,
    link: function postLink(scope, element, attrs) {
      console.log("linking locales directive", scope, element, attrs);
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
