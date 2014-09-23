'use strict';

xdescribe('Controller: SpreadsheetExportController', function() {

  // load the controller's module
  beforeEach(module('spreadsheetApp'));

  var SpreadsheetExportController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope, $modal) {


    $rootScope.results = [{}, {}];
    $rootScope.resultsMessage = $rootScope.results.length + ' Record(s):';

    var modalInstance = $modal.open({
      templateUrl: 'views/export-modal.html',
      controller: 'SpreadsheetExportController',
      size: 'lg',
      resolve: {
        details: function() {
          return {
            resultsMessageFromExternalController: $rootScope.resultsMessage,
            resultsFromExternalController: $rootScope.results,
          };
        }
      }
    });

    modalInstance.result.then(function(any, stuff) {
      console.warn('Some parameters were passed by the modal closing, ', any, stuff);
    }, function() {
      console.log('Export Modal dismissed at: ' + new Date());
    });

    scope = $rootScope.$new();
    SpreadsheetExportController = $controller('SpreadsheetExportController', {
      $scope: scope
    });

  }));

  it('should recieve results from caller', function() {
    expect(scope.results).toBeDefined();
    expect(scope.results.length).toBe(3);
    expect(scope.resultsMessage).toEqual(' ');
  });

});
