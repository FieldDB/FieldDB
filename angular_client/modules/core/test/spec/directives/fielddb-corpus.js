'use strict';

describe('Directive: corpus', function() {

  // load the directive's module
  beforeEach(module('fielddbAngularApp'));
  // load the directive's template
  beforeEach(module('views/corpus.html'));

  var element,
    scope,
    linkFn;

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = angular.element('<corpus></corpus>');
    linkFn = $compile(element);

    // have to digest to bring html from templateCache
    scope.$digest();

    // the html here will still have {{}}
    // console.log('post compile', element.html());
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it('should make hidden element visible', inject(function($compile) {
    // this will create a new scope (since our directive creates 
    // new scope), runs the controller with it, and bind 
    // the element to that new scope
    linkFn(scope);
    scope.$digest();

    console.log(element.html());
    expect(element.text()).toBe('this is the corpus directive');
  }));
});
