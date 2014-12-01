'use strict';

describe('Directive: d3Tree', function () {

  // load the directive's module
  beforeEach(module('visualizationApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<d3-tree></d3-tree>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the d3Tree directive');
  }));
});
