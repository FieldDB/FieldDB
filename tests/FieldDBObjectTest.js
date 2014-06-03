var FieldDBObject = require("../api/FieldDBObject").FieldDBObject;


describe("FieldDBObject", function() {
  it("should accept a json object", function() {
    var u = new FieldDBObject();
    u.aproperty = "hasavalue";
    expect(u.aproperty).toEqual("hasavalue");

    u = new FieldDBObject({
      aproperty: "adifferentvalue"
    });
    expect(u.aproperty).toEqual("adifferentvalue");
  });
  it("should accept a json object on extended classes", function() {

    var Child = function Child(options) {
      // console.log("In Child ", options);
      FieldDBObject.apply(this, arguments);
    };

    Child.prototype = Object.create(FieldDBObject.prototype, /** @lends Child.prototype */ {
      constructor: {
        value: Child
      }
    });

    // var u = new Child();
    // u.aproperty = "hasavalue";
    // expect(u.aproperty).toEqual("hasavalue");

    var u2 = new Child({
      aproperty: "adifferentvalue"
    });
    expect(u2.aproperty).toEqual("adifferentvalue");
  });

  describe("FieldDBObject Cloning", function() {
    var penguin;
    var body = [{
      wings: "flightless"
    }, {
      feet: "good-for-walking"
    }];

    beforeEach(function() {
      penguin = new FieldDBObject({
        body: body,
        _id: "firstPenguin",
        _rev: "2-123"
      });
    });

    it("should not clone id and rev", function() {
      expect(penguin.rev).toEqual("2-123");
      var babypenguin = penguin.clone();
      expect(penguin.rev).toEqual("2-123");
      expect(babypenguin.rev).toBeUndefined();
    });

    it("should clone objects deeply", function() {
      expect(penguin.body).toBe(body);
      var babypenguin = penguin.clone();

      expect(babypenguin.body).not.toBe(body);
      expect(babypenguin.body).toEqual(body);

      penguin.body.beak = "yellow";
      expect(penguin.body.beak).toEqual("yellow");
      expect(babypenguin.body.beak).toBeUndefined();
    });

    it("should have side effects on the original object", function() {
      var babypenguin = penguin.clone();
      penguin.body.beak = "yellow";

      expect(penguin.body.beak).toEqual("yellow");
      expect(babypenguin.body.beak).toBeUndefined();
    });

    it("should add a new linked data to the original", function() {
      var babypenguin = penguin.clone();

      expect(babypenguin.linkedData).toEqual([{
        uri: 'firstPenguin?rev=2-123',
        relation: 'clonedFrom'
      }]);
    });

  });

});
