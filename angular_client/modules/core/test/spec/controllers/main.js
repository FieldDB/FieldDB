'use strict';

describe('Controller: FieldDBController', function() {

  // load the controller's module
  beforeEach(module('fielddbAngularApp', 'views/corpus-page.html', 'views/import-page.html'));

  var FieldDBController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    FieldDBController = $controller('FieldDBController', {
      $scope: scope
    });
  }));

  it('should attach a server connection to the scope', function() {
    expect(scope.connection.online).toBe(true);
  });
});


// http://stackoverflow.com/questions/15990102/angularjs-route-unit-testing
xdescribe('FieldDBController Routes', function() {
  beforeEach(module('fielddbAngularApp'));

  var FieldDBController,
    scope;

  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    FieldDBController = $controller('FieldDBController', {
      $scope: scope
    });
  }));

  it('should load a corpus dashboard', function() {

    inject(function($route, $location, $rootScope, $httpBackend) {
      expect($route.current).toBeUndefined();

      $httpBackend.expectGET('views/corpus-page.html').respond(200);
      $location.path('/lingllama/community_corpus');
      $rootScope.$digest();
      console.log($route);

      expect($route.current).toBeDefined();
      expect($route.current.templateUrl).toBe('views/corpus-page.html');
      expect($route.current.controller).toBe('FieldDBController');

    });
  });

  it('should load a import data dashboard by default', function() {

    inject(function($route, $location, $rootScope, $httpBackend) {
      expect($route.current).toBeUndefined();

      $httpBackend.expectGET('views/import-page.html').respond(200);
      $location.path('/community/georgian/import');
      $rootScope.$digest();

      expect($location.path()).toBe('/community/georgian/import/data');
      expect($route.current.templateUrl).toEqual('views/import-page.html');
      expect($route.current.controller).toBe('FieldDBController');
    });
  });

});
