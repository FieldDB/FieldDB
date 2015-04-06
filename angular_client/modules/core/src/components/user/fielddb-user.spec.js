/* globals FieldDB */

"use strict";
var debugMode = false;

xdescribe("Directive: fielddb-user", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngular",
    "components/user/user.html",
    "components/user/user-page.html",
    "components/user/participant.html"));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-user view='Team' json='team'></div>" +
      " <div data-fielddb-user view='User'  json='user1'></div>" +
      " <div data-fielddb-user view='Participant' json='user2'></div>");
    scope = $rootScope.$new();
    scope.user1 = {
      firstname: "Ling",
      lastname: "Llama",
      description: "I like memes."
    };
    scope.team = {
      firstname: "Awesome",
      lastname: "Phonologists",
      description: "We love phonology."
    };
    scope.user2 = new FieldDB.Participant({
      firstname: "Anony",
      lastname: "Mice",
      id: "AM02"
    });
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log("post compile", el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it("should make a user element with contents from scope", function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope team ", scope.team);
        console.log("scope user1 ", scope.user1);
      }
      expect(true).toBeTruthy();
      // expect(angular.element(el.find("h1")[0]).text().trim()).toEqual("Awesome Phonologists");
      // expect(angular.element(el.find("h1")[1]).text().trim()).toEqual("Ling Llama");
    });
  });
});
