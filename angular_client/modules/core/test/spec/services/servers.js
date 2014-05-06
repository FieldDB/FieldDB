'use strict';

describe('Service: Servers', function () {

  // load the service's module
  beforeEach(module('fielddbAngularApp'));

  // instantiate service
  var Servers;
  beforeEach(inject(function (_Servers_) {
    Servers = _Servers_;
  }));

  it('should do something', function () {
    expect(!!Servers).toBe(true);
  });

});
