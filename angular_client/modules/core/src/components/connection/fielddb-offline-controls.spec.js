"use strict";
var debugMode = false;

describe("Directive: fielddb-offline-controls", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngular"));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-offline-controls json='application'></div>");
    scope = $rootScope.$new();
    scope.application = {
      apiURL: "https://localhost:8131",
      offlineCouchURL: "https://localhost:6984",
      online: true
    };
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log("post compile", el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it("should make a terms of use element with contents from scope", function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope application ", scope.application);
        console.log(el.find("input"));
      }

      expect(el.find("input")[0].checked).toEqual(true);
    });
  });
});
