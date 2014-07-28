'use strict';

describe('Directive: fielddb-participants', function() {

  // load the directive's module and the template
  beforeEach(module('fielddbAngularApp', 'views/user.html', 'views/participants.html'));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element('<div data-fielddb-participants json="participants2"></div> <div data-fielddb-participants json="participants1"></div>');
    scope = $rootScope.$new();
    scope.participants1 = [{
      firstname: 'Ling',
      lastname: 'Llama'
    }];
    scope.participants2 = [{
      firstname: 'Anony',
      lastname: 'Mouse'
    }];
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    console.log('post compile', el.html()); // <== html here has {{}}
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it('should make a participants element with contents from scope', function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      console.log('post link', el.html());
      console.log('scope team ', scope.team);
      console.log('scope participants1 ', scope.participants1);
      // console.log(angular.element(el.find('h1')));
      expect(angular.element(el.find('h1')[0]).text().trim()).toEqual('Anony Mouse');
      expect(angular.element(el.find('h1')[1]).text().trim()).toEqual('Ling Llama');
    });
  });
});
