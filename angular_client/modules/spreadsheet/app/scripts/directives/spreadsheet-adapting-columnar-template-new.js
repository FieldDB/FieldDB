/* globals  FieldDB, alert */
'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetAdaptingColumnarTemplateNew
 * @description
 * # spreadsheetAdaptingColumnarTemplateNew
 */
angular.module('spreadsheetApp').directive('spreadsheetAdaptingColumnarTemplateNew', function() {
  var controller = function($scope, $rootScope, $timeout) {


    $scope.createRecord = function(fieldDBDatum, $event) {
      if ($event && $event.type && $event.type === "submit" && $event.target) {
        $scope.setDataEntryFocusOn($event.target);
      }
      alert("TODO test this");

      fieldDBDatum.save().done(function(error) {
        if (!fieldDBDatum.id) {
          fieldDBDatum.warn("Couldnt contact the database to save this datum, giving a random id and putting it in the session list for saving again later", error);
          fieldDBDatum.id = FieldDB.FieldDBObject.uuidGenerator();
        }
        if (fieldDBDatum.session !== $rootScope.application.currentSession) {
          fieldDBDatum.session = $rootScope.application.currentSession;
        }
      });
      // $rootScope.application.corpus.currentSession.docs.unsaved = true;

      $rootScope.application.currentSession.add(fieldDBDatum);
      $rootScope.application.corpus.currentSession.newDatum = $rootScope.application.corpus.newDatum();


      $scope.activeDatumIndex = "newEntry";

      $rootScope.application.currentSession.render();
    };

    $scope.setDataEntryFocusOn = function(targetDatumEntryDomElement) {
      $timeout(function() {
        if (targetDatumEntryDomElement && targetDatumEntryDomElement[1]) {
          console.log("old focus", document.activeElement);
          targetDatumEntryDomElement[1].focus();
          console.log("new focus", document.activeElement);
        } else {
          console.warn("requesting focus on an element that doesnt exist.");
        }
      }, 500);
    };

  };
  return {
    templateUrl: 'views/adapting-columnar-template-new.html',
    restrict: 'A',
    transclude: false,
    controller: controller,
    // replace: true,
    // scope: {
    //   corpus: '=json'
    // },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {}
  };
});
