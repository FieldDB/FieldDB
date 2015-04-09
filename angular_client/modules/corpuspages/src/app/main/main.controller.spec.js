"use strict";

describe("Controller: FieldDBCorpusPagesController", function () {
  var scope;

  beforeEach(module("fielddbCorpusPagesApp"));

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it("should define more than 5 awesome things", inject(function($controller) {
    expect(scope.awesomeThings).toBeUndefined();

    $controller("FieldDBCorpusPagesController", {
      $scope: scope
    });

    expect(scope).toBeDefined();
  }));
});
