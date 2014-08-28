'use strict';

describe('Filter: fielddbShortDate', function () {

  // load the filter's module
  beforeEach(module('fielddbAngularApp'));

  // initialize a new instance of the filter before each test
  var fielddbShortDate;
  beforeEach(inject(function ($filter) {
    fielddbShortDate = $filter('fielddbShortDate');
  }));


  it('should convert json dates with escaped quotes into DD-MM-YYYY HH:SS', function() {
    var inputDate = '\"2014-07-14T14:39:10.916Z\"';
    expect(fielddbShortDate(inputDate)).toBe('07/14/2014');
  });

  it('should convert json dates with quotes into DD-MM-YYYY HH:SS', function() {
    var inputDate = '"2014-07-14T14:39:10.916Z"';
    expect(fielddbShortDate(inputDate)).toBe('07/14/2014');
  });

  it('should convert json dates into DD-MM-YYYY HH:SS', function() {
    var inputDate = '2014-07-14T14:39:10.916Z';
    expect(fielddbShortDate(inputDate)).toBe('07/14/2014');
  });

  it('should convert timestamps into DD-MM-YYYY HH:SS', function() {
    var inputDate = 1405348750916;
    expect(fielddbShortDate(inputDate)).toBe('07/14/2014');
  });

  it('should convert dates into DD-MM-YYYY HH:SS', function() {
    var inputDate = new Date(1405348750916);
    expect(fielddbShortDate(inputDate)).toBe('07/14/2014');
  });

});
