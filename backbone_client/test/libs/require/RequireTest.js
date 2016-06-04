"use strict";

define([
  "./RequireHelloWorld"
], function(
  HelloWorld
) {
  function registerTests() {
    describe("Require.js", function() {
      it("should return hello world!", function() {
        expect(HelloWorld()).toEqual("hello world!");
      });
    });
  }

  return {
    describe: registerTests
  };
});
