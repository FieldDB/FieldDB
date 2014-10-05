'use strict';

describe('Directive: fielddbGlosserInput', function () {

  // load the directive's module
  beforeEach(module('spreadsheetApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<fielddb-glosser-input></fielddb-glosser-input>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the fielddbGlosserInput directive');
  }));
});
