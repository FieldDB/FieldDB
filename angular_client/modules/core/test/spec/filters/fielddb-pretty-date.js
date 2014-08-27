'use strict';

describe('Filter: fielddbPrettyDate', function() {

  // load the filter's module
  beforeEach(module('fielddbAngularApp'));

  // initialize a new instance of the filter before each test
  var fielddbPrettyDate;
  beforeEach(inject(function($filter) {
    fielddbPrettyDate = $filter('fielddbPrettyDate');
  }));

  it('should convert json dates with escaped quotes into YYYY-MM-DD HH:SS', function() {
    var inputDate = '\"2014-07-14T14:39:10.916Z\"';
    expect(fielddbPrettyDate(inputDate)).toBe('14/07/2014 10:39');
  });

  it('should convert json dates with quotes into YYYY-MM-DD HH:SS', function() {
    var inputDate = '"2014-07-14T14:39:10.916Z"';
    expect(fielddbPrettyDate(inputDate)).toBe('14/07/2014 10:39');
  });

  it('should convert json dates into YYYY-MM-DD HH:SS', function() {
    var inputDate = '2014-07-14T14:39:10.916Z';
    expect(fielddbPrettyDate(inputDate)).toBe('14/07/2014 10:39');
  });

  it('should convert timestamps into YYYY-MM-DD HH:SS', function() {
    var inputDate = 1405348750916;
    expect(fielddbPrettyDate(inputDate)).toBe('14/07/2014 10:39');
  });

  it('should convert dates into YYYY-MM-DD HH:SS', function() {
    var inputDate = new Date(1405348750916);
    expect(fielddbPrettyDate(inputDate)).toBe('14/07/2014 10:39');
  });

});
