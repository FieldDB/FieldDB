/* globals FieldDB, localStorage */
"use strict";
var debugMode = false;
localStorage.setItem("_userOverridenLocalePreference", JSON.stringify({
  iso: "ka"
}));

xdescribe("Directive: fielddb-locales", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngular", "components/locales/locales.html"));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-locales ></div>");
    scope = $rootScope.$new();
    if (debugMode) {
      console.log("scope.application", scope.application);
    }
    scope.application = FieldDB.FieldDBObject.application || new FieldDB.App();
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log("post compile", el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it("should show available contexts", function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope locales ", scope.application.locales);
      }
      expect(angular.element(el.find("select")[0]).attr("class")).toContain("ng-pristine ng-valid");
    });
  });

  it("should show available locales", function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope locales ", scope.application.locales);
      }
      expect(angular.element(el.find("select")[0]).attr("class")).toContain("ng-pristine ng-valid");
    });
  });

  // it("should let users set the default context", function() {
  //   //https://egghead.io/lessons/angularjs-unit-testing-directive-scope
  //   compileFunction(scope); // <== the html {{}} are bound
  //   expect(el.scope().locales).toBeDefined();
  // });

  // it("should let users set the current context", function() {
  //   compileFunction(scope); // <== the html {{}} are bound
  //   expect(el.scope().locales).toBeDefined();
  // });

  // it("should let users set the default locale", function() {
  //   //https://egghead.io/lessons/angularjs-unit-testing-directive-scope
  //   compileFunction(scope); // <== the html {{}} are bound
  //   expect(el.scope().locales).toBeDefined();
  // });

  // it("should let users set the current locale", function() {
  //   compileFunction(scope); // <== the html {{}} are bound
  //   expect(el.scope().locales).toBeDefined();
  // });

  //http://stackoverflow.com/questions/15272414/how-can-i-test-events-in-angular/15282932#15282932
  it("should persist the users choice across page loads", function() {
    compileFunction(scope); // <== the html {{}} are bound
    if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application && FieldDB.FieldDBObject.application.contextualizer) {
      expect(FieldDB.FieldDBObject.application.contextualizer.currentLocale.iso).toEqual("ka");
    }

    // expect(angular.element(el.find("select")[0]).scope().locales).toBeDefined();
  });
});
