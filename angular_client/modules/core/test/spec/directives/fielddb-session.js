'use strict';

describe('Directive: fielddbSession', function () {

  // load the directive's module
  beforeEach(module('fielddbAngularApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<fielddb-session></fielddb-session>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the fielddbSession directive');
  }));
});
