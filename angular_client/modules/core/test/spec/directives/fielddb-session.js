"use strict";
var debugMode = false;

describe("Directive: fielddb-session", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngularApp", "views/session.html", "views/session_list_item.html"));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-session json='session2' corpus='corpus'></div> <div data-fielddb-session json='session1' corpus='corpus'></div>");
    scope = $rootScope.$new();
    scope.session1 = new FieldDB.Session({
      fields: [{
        "id": "goal",
        "value": "Testing if session 1 will display",
        "labelFieldLinguists": "Goal",
        "labelNonLinguists": "Goal",
        "labelTranslators": "Goal",
        "shouldBeEncrypted": false,
        "defaultfield": true,
        "help": "The goals of the elicitation session. Why did you get together today, was it the second day of field methods class, or you wanted to collect some stories from you grandmother, or was it to check on some data you found in the literature...",
      }]
    });
    scope.session2 = new FieldDB.Session({
      fields: [{
        "id": "goal",
        "value": "Testing if session 2 will display",
        "labelFieldLinguists": "Goal",
        "labelNonLinguists": "Goal",
        "labelTranslators": "Goal",
        "shouldBeEncrypted": false,
        "defaultfield": true,
        "help": "The goals of the elicitation session. Why did you get together today, was it the second day of field methods class, or you wanted to collect some stories from you grandmother, or was it to check on some data you found in the literature...",
      }]
    });
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log("post compile", el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it("should make a session element with contents from scope", function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope session2 ", scope.session2);
        console.log("scope session1 ", scope.session1);
      }

      expect(angular.element(el.find("dd")[1]).text().trim()).toEqual("Testing if session 1 will display");
      expect(angular.element(el.find("dd")[0]).text().trim()).toEqual("Testing if session 2 will display");
    });
  });
});
