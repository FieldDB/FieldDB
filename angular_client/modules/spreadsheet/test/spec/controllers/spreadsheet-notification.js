'use strict';

xdescribe('Controller: SpreadsheetNotificationController', function() {

  // load the controller's module
  beforeEach(module('spreadsheetApp'));

  var SpreadsheetNotificationController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope, $modal) {


    $rootScope.results = [{}, {}];
    $rootScope.resultsMessage = $rootScope.results.length + ' Record(s):';

    var modalInstance = $modal.open({
      templateUrl: 'views/export-modal.html',
      controller: 'SpreadsheetNotificationController',
      size: 'lg',
      resolve: {
        details: function() {
          return {};
        }
      }
    });

    modalInstance.result.then(function(any, stuff) {
      console.warn('Some parameters were passed by the modal closing, ', any, stuff);
    }, function() {
      console.log('Notification Modal dismissed at: ' + new Date());
    });

    scope = $rootScope.$new();
    SpreadsheetNotificationController = $controller('SpreadsheetNotificationController', {
      $scope: scope
    });

  }));

  it('should recieve results from caller', function() {
    expect(scope.notificationMessage).toBeDefined();
    expect(scope.notificationMessage).toEqual(' ');
  });

});
