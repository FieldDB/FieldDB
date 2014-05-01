'use strict';

describe('Directive: user', function () {

  // load the directive's module
  beforeEach(module('fieldDB'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<user></user>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the user directive');
  }));
});
