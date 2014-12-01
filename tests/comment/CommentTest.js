var Comment= require("../../api/comment/Comment").Comment;
var Comments = require("../../api/comment/Comments").Comments;


describe("Comment: as a team we want to leave comments to eachother, on everthing.", function() {

  describe("construction", function() {

    it("should be load", function() {
      expect(Comment).toBeDefined();
      expect(Comments).toBeDefined();
    });

    it("should be defined", function() {
      var comments = new Comments();
      expect(comments).toBeDefined();
      expect(comments.fieldDBtype).toEqual("Comments");

      comments.add({
        text: "Maybe the gloss should be acc instead of CAUSE?",
        timestamp: Date.now()
      });
      expect(comments.length).toEqual(1);
      expect(comments.collection[0].fieldDBtype).toEqual("Comment");

    });

  });

  it("should allow users to take note of important things and " +
    "communicate between each other", function() {
      expect(true).toBeTruthy();
    });

  it("should show a timestamp and a username by default", function() {
    expect(true).toBeTruthy();
  });

  it("should be editable", function() {
    expect(true).toBeTruthy();
  });

  it("should be removeable", function() {
    expect(true).toBeTruthy();
  });

  it("should appear on datum, sessions, corpora, and dataLists", function() {
    expect(true).toBeTruthy();
  });
});
