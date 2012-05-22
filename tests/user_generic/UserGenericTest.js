 
  describe("UserGeneric", function() {
    it("should expose an attribute", function() {
      //var UserGeneric = require("UserGeneric");
      var episode = new Backbone.Model({
        title : "Hollywood - Part 2"
      });
      expect(episode.get("title")).toEqual("Hollywood - Part 2");
    });
  });
