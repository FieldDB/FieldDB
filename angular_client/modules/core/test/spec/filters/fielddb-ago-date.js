'use strict';

describe('Filter: fielddbAgoDate', function () {

  // load the filter's module
  beforeEach(module('fielddbAngularApp'));

  // initialize a new instance of the filter before each test
  var fielddbAgoDate;
  beforeEach(inject(function ($filter) {
    fielddbAgoDate = $filter('fielddbAgoDate');
  }));

  it('should return the input prefixed with "fielddbAgoDate filter:"', function () {
    var text = 'angularjs';
    expect(fielddbAgoDate(text)).toBe('fielddbAgoDate filter: ' + text);
  });

});
