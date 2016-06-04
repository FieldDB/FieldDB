"use strict";

define([
  "./RequireHelloWorld"
], function(
  HelloWorld
) {
  function registerTests() {
    describe("HelloWorldTest", function() {
      it("should return hello world!", function() {
        expect(HelloWorld()).toEqual("hello world!");
      });
    });
  }

  return {
    describe: registerTests
  };
});
