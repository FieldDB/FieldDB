"use strict";

describe("Directive: fieldAudiofillByBrowser", function() {

  // load the directive's module
  beforeEach(module("fielddbAngularApp"));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
    scope.user = {};
  }));

  it("should make hidden element visible", inject(function($compile) {
    element = angular.element("<input type=\"text\" name=\"username\" ng-model=\"user.id\" field-audiofill-by-browser=\"autofill\"/>");
    element = $compile(element)(scope);
    element.find("input")[0].value = "savedusername";
    expect(scope.user.id).toEqual("savedusername");
    expect(element.text()).toBe("this is the fieldAudiofillByBrowser directive");
  }));
});
