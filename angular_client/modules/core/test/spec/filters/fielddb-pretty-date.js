'use strict';

describe('Filter: fielddbPrettyDate', function() {

  // load the filter's module
  beforeEach(module('fielddbAngularApp'));

  // initialize a new instance of the filter before each test
  var fielddbPrettyDate;
  beforeEach(inject(function($filter) {
    fielddbPrettyDate = $filter('fielddbPrettyDate');
  }));

  it('should convert json dates with escaped quotes into DD-MM-YYYY HH:SS', function() {
    var inputDate = '\"2014-07-14T14:39:10.916Z\"';
    expect(fielddbPrettyDate(inputDate)).toBe('07/14/2014 10:39');
  });

  it('should convert json dates with quotes into DD-MM-YYYY HH:SS', function() {
    var inputDate = '"2014-07-14T14:39:10.916Z"';
    expect(fielddbPrettyDate(inputDate)).toBe('07/14/2014 10:39');
  });

  it('should convert json dates into DD-MM-YYYY HH:SS', function() {
    var inputDate = '2014-07-14T14:39:10.916Z';
    expect(fielddbPrettyDate(inputDate)).toBe('07/14/2014 10:39');
  });

  it('should convert timestamps into DD-MM-YYYY HH:SS', function() {
    var inputDate = 1405348750916;
    expect(fielddbPrettyDate(inputDate)).toBe('07/14/2014 10:39');
  });

  it('should convert dates into DD-MM-YYYY HH:SS', function() {
    var inputDate = new Date(1405348750916);
    expect(fielddbPrettyDate(inputDate)).toBe('07/14/2014 10:39');
  });

  describe('edge cases', function() {

    it('should show N/A if the date is 2000-09-06T16:31:30.988Z', function() {
      var inputDate = new Date('2000-09-06T16:31:30.988Z');
      expect(fielddbPrettyDate(inputDate)).toBe('N/A');

      inputDate = '2000-09-06T16:31:30.988Z';
      expect(fielddbPrettyDate(inputDate)).toBe('N/A');

      inputDate = '"2000-09-06T16:31:30.988Z"';
      expect(fielddbPrettyDate(inputDate)).toBe('N/A');
    });

    it('should show -- if the date is empty', function() {
      var inputDate = '';
      // expect(fielddbPrettyDate(inputDate)).toBe('--');

      inputDate = undefined;
      expect(fielddbPrettyDate(inputDate)).toBe('--');

      inputDate = 0;
      expect(fielddbPrettyDate(inputDate)).toBe('--');

      inputDate = null;
      expect(fielddbPrettyDate(inputDate)).toBe('--');

      inputDate = '  ';
      expect(fielddbPrettyDate(inputDate)).toBe('--');
    });

  });
});
