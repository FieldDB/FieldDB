'use strict';

describe('Filter: fielddbPrettyDate', function () {

  // load the filter's module
  beforeEach(module('fielddbAngularApp'));

  // initialize a new instance of the filter before each test
  var fielddbPrettyDate;
  beforeEach(inject(function ($filter) {
    fielddbPrettyDate = $filter('fielddbPrettyDate');
  }));

  it('should return the input prefixed with "fielddbPrettyDate filter:"', function () {
    var text = 'angularjs';
    expect(fielddbPrettyDate(text)).toBe('fielddbPrettyDate filter: ' + text);
  });

});
