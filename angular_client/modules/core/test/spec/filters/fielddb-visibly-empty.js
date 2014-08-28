'use strict';

describe('Filter: fielddbVisiblyEmpty', function() {

  // load the filter's module
  beforeEach(module('fielddbAngularApp'));

  // initialize a new instance of the filter before each test
  var fielddbVisiblyEmpty;
  beforeEach(inject(function($filter) {
    fielddbVisiblyEmpty = $filter('fielddbVisiblyEmpty');
  }));

  it('should return show " " as visibly empty', function() {
    var text = ' ';
    expect(fielddbVisiblyEmpty(text)).toBe('--');
  });

  it('should return show "" as visibly empty', function() {
    var text = ' ';
    expect(fielddbVisiblyEmpty(text)).toBe('--');
  });

  it('should return show undefined as visibly empty', function() {
    var text = ' ';
    expect(fielddbVisiblyEmpty(text)).toBe('--');
  });

  it('should return show null as visibly empty', function() {
    var text = ' ';
    expect(fielddbVisiblyEmpty(text)).toBe('--');
  });

  it('should not show 0 as visibly empty', function() {
    var text = 0;
    expect(fielddbVisiblyEmpty(text)).toBe(0);
  });

  it('should return show "  noqata tusunaywanmi " without whitespace', function() {
    var text = '  noqata tusunaywanmi ';
    expect(fielddbVisiblyEmpty(text)).toBe('noqata tusunaywanmi');
  });

});
