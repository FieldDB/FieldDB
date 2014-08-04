'use strict';
var debug = true;

describe('Directive: fielddb-contenteditable', function() {

  // load the directive's module and the template
  beforeEach(module('fielddbAngularApp'));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element('<div> <span contenteditable="true" ng-model="userContent" strip-br="true" select-non-editable="true"> </span><textarea ng-model="userContent"></textarea></div> ');
    scope = $rootScope.$new();
    scope.userContent = 'Community Corpus';
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

      expect(el.find('span').text().trim()).toEqual('Community Corpus');
      expect(el.find('textarea').val().trim()).toEqual('Community Corpus');

      el.find('span').text('My new title');
      if (el.find('span')[0] && el.find('span')[0].click) {
        el.find('span')[0].click();
      }
      if (el.find('span')[0] && el.find('span')[0].blur) {
        el.find('span')[0].blur();
      }

      // expect(scope.userContent).toEqual('My new title');
    });

  });

  xit('should data-bind and become invalid', function() {
    expect(false).toBeTruthy();
  });

});
