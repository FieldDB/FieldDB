'use strict';
var debugMode = false;

xdescribe('Directive: spreadsheet-adapting-columnar-template-read', function() {

  // load the directive's module and the template
  beforeEach(module('spreadsheetApp', 'views/adapting-columnar-template-read.html'));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element('<div data-spreadsheet-adapting-columnar-template-read ></div>');
    scope = $rootScope.$new();
    scope.data = [];
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log('post compile', el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it('should make an element with contents from scope', function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log('post link', el.html());
        console.log('scope corpus ', scope.corpus);
        console.log(angular.element(el.find('p')[0]));
      }
      expect(angular.element(el.find('p')[0]).text().trim()).toEqual('testing');
    });
  });
});
