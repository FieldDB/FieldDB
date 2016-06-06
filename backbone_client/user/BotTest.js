define([
  "user/ReportBot",
  "user/UserGeneric"
], function(
  Bot,
  UserGeneric
) {
  "use strict";

  function registerTests() {
    describe("Bot", function() {
      it("should create a bot", function() {
        var b = new Bot();
        expect(b instanceof Bot).toBeTruthy();
      });

      it("should be a type of user", function() {
        var b = new Bot();
        expect(b instanceof UserGeneric).toBeTruthy();
      });

      it("should create multiple bots", function() {
        var bots = [];
        bots.push(new Bot());
        bots.push(new Bot());
        bots.push(new Bot());

        expect(bots.length).toEqual(3);
      });
    });
  }

  return {
    describe: registerTests
  };
});
