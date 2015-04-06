"use strict";
var debugMode = false;

xdescribe("Directive: fielddb-corpus", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngular", "collection/corpus/corpus.html"));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-corpus json='corpus'></div>");
    scope = $rootScope.$new();
    scope.corpus = {
      title: "Community Corpus",
      description: "Testing if corpus directive can load"
    };
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log("post compile", el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it("should make a corpus element with contents from scope", function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope corpus ", scope.corpus);
      }
      expect(el.find("h1").text().trim()).toEqual("Community Corpus");
    });
  });
});
