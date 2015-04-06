"use strict";
var debugMode = false;

describe("Directive: fielddb-doc", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngularApp", "views/user.html"));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-doc json='team'></div> <div data-fielddb-doc json='user'></div>");
    scope = $rootScope.$new();
    scope.user = {
      firstname: "Ling",
      lastname: "Llama",
      description: "I like memes.",
      fieldDBtype: "UserMask"
    };
    scope.team = {
      firstname: "Awesome",
      lastname: "Phonologists",
      description: "We love phonology.",
      fieldDBtype: "Team"
    };
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log("post compile", el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it("should make a doc element with contents from scope", function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope team ", scope.team);
        console.log("scope user ", scope.user);
      }
      expect(angular.element(el.find("h1")[0]).text().trim()).toEqual("Awesome Phonologists");
      expect(angular.element(el.find("h1")[1]).text().trim()).toEqual("Ling Llama");
    });
  });
});
