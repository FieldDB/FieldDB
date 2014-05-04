'use strict';

describe('Controller: CorpusPageCtrl', function () {

  // load the controller's module
  beforeEach(module('corpuspagesApp'));

  var CorpusPageCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CorpusPageCtrl = $controller('CorpusPageCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
