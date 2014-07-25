'use strict';

xdescribe('Directive: fielddbAuthentication', function () {

  // load the directive's module
  beforeEach(module('fielddbAngularApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<fielddb-authentication></fielddb-authentication>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the fielddbAuthentication directive');
  }));
});
