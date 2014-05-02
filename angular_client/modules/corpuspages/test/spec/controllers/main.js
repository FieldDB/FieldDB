'use strict';

describe('Controller: FieldDBCorpusPagesController', function () {

  // load the controller's module
  beforeEach(module('corpuspagesApp'));

  var FieldDBCorpusPagesController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FieldDBCorpusPagesController = $controller('FieldDBCorpusPagesController', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
