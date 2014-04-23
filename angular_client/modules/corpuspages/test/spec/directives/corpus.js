'use strict';

describe('Directive: corpus', function () {

  // load the directive's module
  beforeEach(module('corpuspagesApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<corpus></corpus>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the corpus directive');
  }));
});
