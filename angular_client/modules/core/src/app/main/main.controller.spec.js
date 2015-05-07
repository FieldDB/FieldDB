/* globals console */

"use strict";
var debugMode = false;

describe("Controller: FieldDBController", function() {

  // load the controller's module
  beforeEach(module("fielddbAngular"));

  var scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it("should attach a server connection to the scope", inject(function($controller) {
    expect(scope.application).toBeUndefined();

    $controller("FieldDBController", {
      $scope: scope
    });

    expect(angular.isObject(scope.application)).toBeTruthy();
    // expect(scope.application).toBe(true);
    expect(scope.application.online).toBe(true);

  }));

  it("should display a list of components which can be used", inject(function($controller) {
    expect(FieldDB).toBeDefined();

    $controller("FieldDBController", {
      $scope: scope
    });

    expect(scope.FieldDBComponents).toBeDefined();
    expect(scope.FieldDBComponents.User).toEqual({
      fieldDBtype: "User",
      url: "http://opensourcefieldlinguistics.github.io/FieldDB/docs/javascript/User.html"
    });
  }));
});


// http://stackoverflow.com/questions/15990102/angularjs-route-unit-testing
xdescribe("FieldDBController Routes", function() {
  beforeEach(module("fielddbAngular"));

  var FieldDBController,
    scope;

  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    FieldDBController = $controller("FieldDBController", {
      $scope: scope
    });
  }));

  it("should load a corpus dashboard", function() {

    inject(function($route, $location, $rootScope, $httpBackend) {
      expect($route.current).toBeUndefined();

      $httpBackend.expectGET("components/corpus/corpus-page.html").respond(200);
      $location.path("/lingllama/communitycorpus");
      $rootScope.$digest();
      if (debugMode) {
        console.log($route);
      }

      expect($route.current).toBeDefined();
      expect($route.current.templateUrl).toBe("components/corpus/corpus-page.html");
      expect($route.current.controller).toBe("FieldDBController");

    });
  });

  it("should load a import data dashboard by default", function() {

    inject(function($route, $location, $rootScope, $httpBackend) {
      expect($route.current).toBeUndefined();

      $httpBackend.expectGET("components/import/import-page.html").respond(200);
      $location.path("/community/georgian/import");
      $rootScope.$digest();

      expect($location.path()).toBe("/community/georgian/import/data");
      expect($route.current.templateUrl).toEqual("components/import/import-page.html");
      expect($route.current.controller).toBe("FieldDBController");
    });
  });

});
