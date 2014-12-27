"use strict";

describe("Directive: fielddbDatumField", function() {

  // load the directive"s module
  beforeEach(module("fielddbAngularApp"));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it("should make hidden element visible", inject(function($compile) {
    element = angular.element("<fielddb-datum-field></fielddb-datum-field>");
    element = $compile(element)(scope);
    expect(element.text()).toBe("this is the fielddbDatumField directive");
  }));
});
