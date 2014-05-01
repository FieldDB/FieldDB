'use strict';

xdescribe('Directive: fielddbCorpusTermsOfUse', function () {

  // load the directive's module
  beforeEach(module('fielddbAngularApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<fielddb-corpus-terms-of-use></fielddb-corpus-terms-of-use>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the fielddbCorpusTermsOfUse directive');
  }));
});
