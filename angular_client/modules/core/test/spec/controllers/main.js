'use strict';

describe('Controller: FieldDBController', function () {

  // load the controller's module
  beforeEach(module('fielddbAngularApp'));

  var FieldDBController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FieldDBController = $controller('FieldDBController', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
