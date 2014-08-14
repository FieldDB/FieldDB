'use strict';
var debug = false;

describe('Directive: fielddb-datum', function() {

  // load the directive's module and the template
  beforeEach(module('fielddbAngularApp', 'views/datum.html'));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element('<div data-fielddb-datum json="datum2" corpus="corpus"></div> <div data-fielddb-datum json="datum1" corpus="corpus"></div>');
    scope = $rootScope.$new();
    scope.datum1 = {
      datumFields: [{
        'id': 'morphemes',
        'value': 'Noqa-ta tusu-nay-wa-n-mi',
        'labelLinguists': 'Morphemes',
        'labelNonLinguists': '',
        'labelTranslators': 'Prefix-z-root-suffix-z',
        'type': 'IGT',
        'shouldBeEncrypted': true,
        'showToUserTypes': 'linguist',
        'defaultfield': true,
        'json': {
          'alternates': []
        },
        'help': 'Words divided into prefixes, root and suffixes using a - between each eg: prefix-prefix-root-suffix-suffix-suffix',
      }]
    };
    scope.datum2 = {
      datumFields: [{
        'id': 'morphemes',
        'value': 'Noqa-ta tusu-nay-wan-mi',
        'labelLinguists': 'Morphemes',
        'labelNonLinguists': '',
        'labelTranslators': 'Prefix-z-root-suffix-z',
        'type': 'IGT',
        'shouldBeEncrypted': true,
        'showToUserTypes': 'linguist',
        'defaultfield': true,
        'json': {
          'alternates': []
        },
        'help': 'Words divided into prefixes, root and suffixes using a - between each eg: prefix-prefix-root-suffix-suffix-suffix',
      }]
    };
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debug) {
      console.log('post compile', el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it('should make a datum element with contents from scope', function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debug) {
        console.log('post link', el.html());
        console.log('scope datum2 ', scope.datum2);
        console.log('scope datum1 ', scope.datum1);
      }
      // expect(angular.element(el.find('li')[0]).text().trim()).toEqual('Noqa-ta tusu-nay-wa-n-mi');
      // expect(angular.element(el.find('li')[1]).text().trim()).toEqual('Noqa-ta tusu-nay-wan-mi');
    });
  });
});
