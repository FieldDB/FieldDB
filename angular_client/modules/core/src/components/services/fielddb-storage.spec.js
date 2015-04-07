"use strict";

xdescribe("Service: fielddbStorage", function () {

  // load the service"s module
  beforeEach(module("fielddbAngular"));

  // instantiate service
  var fielddbStorage;
  beforeEach(inject(function (_fielddbStorage_) {
    fielddbStorage = _fielddbStorage_;
  }));

  it("should do something", function () {
    expect(!!fielddbStorage).toBe(true);
  });

});
