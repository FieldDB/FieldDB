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
angular.module('spreadsheetApp')
  .controller('SpreadsheetExportController', function($scope, $modalInstance, details) {

    $scope.resultsMessageFromExternalController = details.resultsMessageFromExternalController;
    $scope.resultsFromExternalController = details.resultsFromExternalController;

    $scope.ok = function() {
      $modalInstance.close($scope.results, $scope.resultsMessage);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  });
