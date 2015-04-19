/*globals FieldDB */

"use strict";
var debugMode = false;
describe("Directive: fielddb-collection", function() {

  describe("multiple lists of collections", function() {

    // load the directive's module and the template
    beforeEach(module("fielddbAngularApp", "views/datum-field.html", "views/collection.html"));
    var el, scope, compileFunction;

    beforeEach(inject(function($rootScope, $compile) {
      el = angular.element("<div data-fielddb-collection json='datumFields'></div>");
      scope = $rootScope.$new();
      scope.datumFields = new FieldDB.Collection([{
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
      }, {
        "id": "relatedData",
        "labelFieldLinguists": "Related Data",
        "labelNonLinguists": "Linked to",
        "labelTranslators": "Linked to",
        "labelComputationalLinguists": "Linked Data",
        "type": "relatedData",
        "shouldBeEncrypted": false,
        "showToUserTypes": "all",
        "defaultfield": true,
        "json": {
          "relatedData": []
        },
        "help": "Related data in the database, or at any web url.",
        "helpLinguists": "Related data in the database, or at any web url.",
        "helpDevelopers": "Related data in the database, or at any web url."
      }]);
      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debugMode) {
        console.log("post compile", el.html()); // <== html here has {{}}
      }
    }));

    // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
    it("should make a collection element with only contents from scope", function() {
      inject(function() {
        compileFunction(scope); // <== the html {{}} are bound
        scope.$digest(); // <== digest to get the render to show the bound values
        if (debugMode) {
          console.log("post link", el.html());
          console.log("scope collection0 ", scope.collection0);
          console.log(angular.element());
        }
        expect(el.find("input").length).toEqual(scope.datumFields.length);
      });
    });
  });


  describe("mocked fetchCollection", function() {

    // load the directive's module and the template
    beforeEach(module("fielddbAngularApp", "views/user.html", "views/collection.html"));
    var el, scope, compileFunction;

    beforeEach(inject(function($rootScope, $compile) {
      el = angular.element("<div data-fielddb-collection json='collection2'></div> <div data-fielddb-collection json='collection1'></div>");
      scope = $rootScope.$new();
      scope.collection1 = new FieldDB.Collection([{
        firstname: "Ling",
        lastname: "Llama",
        id: "one",
        fieldDBtype: "UserMask"
      }, {
        firstname: "Teammate",
        lastname: "Tiger",
        id: "two",
        fieldDBtype: "UserMask"
      }]);
      scope.collection2 = new FieldDB.Collection([{
        firstname: "Anony",
        lastname: "Mouse",
        id: "three",
        fieldDBtype: "UserMask"
      }]);
      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debugMode) {
        console.log("post compile", el.html()); // <== html here has {{}}
      }
    }));

    // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
    it("should make a collection element with contents from scope", function() {

      inject(function() {
        compileFunction(scope); // <== the html {{}} are bound
        scope.$digest(); // <== digest to get the render to show the bound values
        if (debugMode) {
          console.log("post link", el.html());
          console.log("scope collection1 ", scope.collection1);
          console.log(angular.element());
        }
        expect(el.find("input").length).toEqual(3);
      });
    });
  });

});
