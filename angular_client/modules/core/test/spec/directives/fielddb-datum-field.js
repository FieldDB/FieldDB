/* globals FieldDB */
"use strict";
var debugMode = false;

describe("Directive: fielddb-datum-field", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngularApp", "views/datum-field.html"));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-datum-field json='datumField'></div>");
    scope = $rootScope.$new();
    scope.datumField = new FieldDB.DatumField({
      "id": "documentation",
      "labelFieldLinguists": "Discussion for Handouts",
      "labelNonLinguists": "Additional Documentation",
      "labelTranslators": "Documentation",
      "type": "wiki, LaTeX",
      "shouldBeEncrypted": false,
      "showToUserTypes": "all",
      "defaultfield": true,
      "json": {
        "wiki": "",
        "latex": ""
      },
      "help": "Additional discussion of this example (for handouts or for documentation). Wiki or LaTeX formatable.",
      "helpLinguists": "Additional discussion of this example (for handouts or for documentation). Wiki or LaTeX formatable."
    });
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log("post compile", el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it("should make a datumField element with contents from scope", function() {

    inject(function() {
      expect(el.find("label").text().trim()).toEqual("{{datumField.locale_Help_Text}}");
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope datumField ", scope.datumField);
      }
      expect(el.find("input")[1].value.trim()).toEqual("Discussion for Handouts");

    });
  });
});
