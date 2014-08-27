'use strict';

describe('Filter: fielddbVisiblyEmpty', function () {

  // load the filter's module
  beforeEach(module('fielddbAngularApp'));

  // initialize a new instance of the filter before each test
  var fielddbVisiblyEmpty;
  beforeEach(inject(function ($filter) {
    fielddbVisiblyEmpty = $filter('fielddbVisiblyEmpty');
  }));

  it('should return the input prefixed with "fielddbVisiblyEmpty filter:"', function () {
    var text = 'angularjs';
    expect(fielddbVisiblyEmpty(text)).toBe('fielddbVisiblyEmpty filter: ' + text);
  });

});
