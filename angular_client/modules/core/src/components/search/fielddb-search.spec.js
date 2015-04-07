"use strict";
var debugMode = false;

describe("Directive: fielddb-search", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngular"));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-search json='search'></div>");
    scope = $rootScope.$new();
    scope.search = {};
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log("post compile", el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it("should make a search element with contents from scope", function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope search ", scope.search);
      }
      expect(angular.element(el.find("button")[0]).text().trim()).toEqual("Search…");
    });
  });
});
