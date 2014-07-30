'use strict';
var debug = true;

describe('Directive: fielddb-contenteditable', function() {

  // load the directive's module and the template
  beforeEach(module('fielddbAngularApp'));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element('      <form name="myForm"> <h1 contenteditable fielddb-contenteditable     name="myWidget" ng-model="corpus.title" strip-br="true" required></h1> <span ng-show="myForm.myWidget.$error.required">Required!</span> <hr> <textarea  ng-model="corpus.title"></textarea> </form>');
    scope = $rootScope.$new();
    scope.corpus = {
      title: 'Community Corpus',
      description: 'Testing if contenteditable directive can load'
    };
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debug) {
      console.log('post compile', el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it('should make a contenteditable element with contents from scope', function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debug) {
        console.log('post link', el.html());
        console.log('scope contenteditable ', scope.corpus);
      }

      expect(el.find('h1').text().trim()).toEqual('Community Corpus');
      expect(el.find('textarea').text().trim()).toEqual('Community Corpus');

      el.find('h1').text(scope.corpus.title);
      expect(el.find('h1').text().trim()).toEqual('Community Corpus');

      el.find('h1').text('My new title');
      expect(scope.corpus.title).toEqual('My new title');

    });

  });

  xit('should data-bind and become invalid', function() {
    expect(false).toBeTruthy();
  });

});
