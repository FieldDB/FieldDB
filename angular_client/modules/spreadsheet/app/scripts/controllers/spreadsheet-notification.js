'use strict';

/**
 * @ngdoc function
 * @name spreadsheetApp.controller:SpreadsheetNotificationController
 * @description
 * # SpreadsheetNotificationController
 * Controller of the spreadsheetApp
 */

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
// http://angular-ui.github.io/bootstrap/
// http://stackoverflow.com/questions/19204510/modal-window-issue-unknown-provider-modalinstanceprovider
angular.module('spreadsheetApp')
  .controller('SpreadsheetNotificationController', function($scope, $modalInstance, details) {
    console.log('Not using details from caller', details);
    $scope.ok = function() {
      $modalInstance.close();
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  });
