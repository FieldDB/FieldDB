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
      url: "http://fielddb.github.io/FieldDB/docs/javascript/User.html"
    });
  }));
});


// http://stackoverflow.com/questions/15990102/angularjs-state-unit-testing
describe("FieldDBController Routes", function() {
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

    inject(function($state, $location, $rootScope, $httpBackend) {
      expect($state.current).toBeDefined();

      expect($state.href('faq', { team: 'hi' })).toEqual('/faq');
      expect($state.href('corpus', { team: 'lingllama', corpusidentifier: 'communitycorpus' })).toEqual('/lingllama/communitycorpus');

      $httpBackend.expectGET("app/components/corpus/corpus-page.html").respond(200);
      $location.path("/lingllama/communitycorpus");
      $rootScope.$digest();
      if (debugMode) {
        console.log($state);
      }

      $state.go('corpus');
      $rootScope.$digest();
      expect($state.current.name).toBe('corpus');

      expect($state.current).toBeDefined();
      expect($state.current.templateUrl).toBe("app/components/corpus/corpus-page.html");
      expect(typeof $state.current.controller).toEqual("function");
    });
  });

  it("should load a import data dashboard by default", function() {

    inject(function($state, $location, $rootScope, $httpBackend) {
      expect($state.current).toBeDefined();

      $httpBackend.expectGET("app/components/import/import-page.html").respond(200);
      $location.path("/community/georgian/import");
      $rootScope.$digest();

      expect($location.path()).toBe("/community/georgian/import");
      expect($state.current.templateUrl).toEqual("app/components/import/import-page.html");
      expect(typeof $state.current.controller).toEqual("function");

      $state.go("corpus");
      $rootScope.$digest();
      expect($state.current.name).toBe("corpus");

      $state.go("corpus.import");
      $rootScope.$digest();
      expect($state.current.name).toBe("corpus.import");
    });
  });

});
