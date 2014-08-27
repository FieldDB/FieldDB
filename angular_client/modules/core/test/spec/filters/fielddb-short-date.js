'use strict';

describe('Filter: fielddbShortDate', function () {

  // load the filter's module
  beforeEach(module('fielddbAngularApp'));

  // initialize a new instance of the filter before each test
  var fielddbShortDate;
  beforeEach(inject(function ($filter) {
    fielddbShortDate = $filter('fielddbShortDate');
  }));

  it('should return the input prefixed with "fielddbShortDate filter:"', function () {
    var text = 'angularjs';
    expect(fielddbShortDate(text)).toBe('fielddbShortDate filter: ' + text);
  });

});
