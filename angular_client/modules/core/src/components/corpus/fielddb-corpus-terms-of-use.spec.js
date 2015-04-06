"use strict";
var debugMode = false;

xdescribe("Directive: fielddb-corpus-terms-of-use", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngular", "collection/corpus/terms-of-use.html"));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-corpus-terms-of-use json='corpus'></div>");
    scope = $rootScope.$new();
    scope.corpus = {
      title: "Community Corpus",
      description: "Testing if corpus directive can load",
      termsOfUse: {
        humanReadable: "Sample: The materials included in this corpus"
      },
      license: {
        title: "Default: Creative Commons",
        humanReadable: "This license lets others remix",
        imageUrl: "https://example.org/logo.png",
        link: "http://example.org/1/"
      },
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
        console.log("scope corpus ", scope.corpus);
        console.log(angular.element(el.find("p")[0]));
      }
      expect(angular.element(el.find("p")[0]).text().trim()).toEqual("Sample: The materials included in this corpus");
    });
  });
});
