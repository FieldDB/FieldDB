'use strict';

/**
 * @ngdoc function
 * @name spreadsheetApp.controller:SpreadsheetExportController
 * @description
 * # SpreadsheetExportController
 * Controller of the spreadsheetApp
 */

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
// http://angular-ui.github.io/bootstrap/
// http://stackoverflow.com/questions/19204510/modal-window-issue-unknown-provider-modalinstanceprovider
angular.module('spreadsheetApp').controller('SpreadsheetExportController', function($scope, $modalInstance, details) {

  $scope.resultsMessageFromExternalController = details.resultsMessageFromExternalController;
  $scope.resultsFromExternalController = details.resultsFromExternalController;

  if (window.location.origin.indexOf("mcgill") > -1) {
    $scope.useWordpressIGTFormat = true;
  } else {
    $scope.useWordpressIGTFormat = false;
  }

  try {
    var previousValue = localStorage.getItem("useWordpressIGTFormat");
    if (previousValue === "false") {
      $scope.useWordpressIGTFormat = false;
    } else if (previousValue === "true") {
      $scope.useWordpressIGTFormat = true;
    }
  } catch (e) {
    console.log("useWordpressIGTFormat was not previously set.");
  }

  $scope.$watch('useWordpressIGTFormat', function(newvalue, oldvalue) {
    console.log("useWordpressIGTFormat", oldvalue);
    if (newvalue !== undefined) {
      localStorage.setItem("useWordpressIGTFormat", newvalue);
    }
  });

  $scope.ok = function() {
    $modalInstance.close($scope.results, $scope.resultsMessage);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
});
