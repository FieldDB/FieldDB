'use strict';

describe('Directive: corpus', function() {

  // load the directive's module and the template
  beforeEach(module('fielddbAngularApp', 'views/corpus.html'));
  var element, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    $rootScope.corpus = {
      title: 'Community Corpus',
      description: 'Testing if corpus directive can load'
    };
    element = angular.element('<div data-fielddb-corpus json="corpus"></div>');
    scope = $rootScope;
    compileFunction = $compile(element);
    // bring html from templateCache
    scope.$digest();
    console.log('post compile', element.html()); // <== html here has {{}}
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it('should make a corpus element', function() {

    inject(function() {
      compileFunction(scope);
      // scope.$digest();
      console.log('post link', element.html()); // <== the html {{}} are bound
      console.log('scope corpus ', scope.corpus);

      scope.$digest(); // <== digest to get the render to show the bound values
      expect(element.find('h1').text().trim()).toEqual('Community Corpus');
    });
  });
});
