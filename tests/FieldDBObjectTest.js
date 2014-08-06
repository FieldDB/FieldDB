var FieldDBObject = require("../api/FieldDBObject").FieldDBObject;


describe("FieldDBObject", function() {

  describe("construction", function() {

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
        this.debug("In Child ", options);
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


    it("should add dateCreated if it was missing", function() {
      var u = new FieldDBObject();
      expect(u.dateCreated).toBeDefined();
    });

  });

  describe("serialization", function() {
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

    it("should not loose attributes that were in the original JSON", function() {
      var resultingJSON = penguin.toJSON();
      expect(resultingJSON.body).toBe(body);
      expect(resultingJSON._id).toEqual("firstPenguin");
      expect(resultingJSON._rev).toEqual("2-123");
    });


    it("should not introduce attributes that weren't in the original JSON", function() {
      var resultingJSON = penguin.toJSON();
      expect(resultingJSON).toEqual({
        body: [{
          wings: "flightless"
        }, {
          feet: "good-for-walking"
        }],
        _id: "firstPenguin",
        _rev: "2-123",
        version: FieldDBObject.DEFAULT_VERSION
      });

      var accessingAttributeShouldNotCauseItToExist = penguin.dbname;
      expect(accessingAttributeShouldNotCauseItToExist).toEqual(FieldDBObject.DEFAULT_STRING);

      accessingAttributeShouldNotCauseItToExist = penguin.dateModified;
      expect(accessingAttributeShouldNotCauseItToExist).toEqual(FieldDBObject.DEFAULT_DATE);

      expect(penguin.toJSON()).toEqual(resultingJSON);
    });


    it("should be possible to request a smaller object with empty attributes removed if caller requests", function() {
      var resultingJSON = new FieldDBObject({
        body: [],
        _id: "firstPenguin",
        _rev: ""
      }).toJSON(null, "removeEmptyAttributes");

      expect(resultingJSON).toEqual({
        _id: "firstPenguin",
        version: FieldDBObject.DEFAULT_VERSION
      });
    });

    it("should be possible to request a complete object if caller requests", function() {
      var resultingJSON = new FieldDBObject({
        dateCreated: 1,
        _id: "123"
      }).toJSON("complete");
      expect(resultingJSON).toEqual({
        dateCreated: 1,
        _id: '123',
        version: 'v2.0.1',
        dbname: '',
        dateModified: 0
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

      expect(babypenguin.relatedData).toEqual([{
        URI: "firstPenguin?rev=2-123",
        relation: "clonedFrom"
      }]);
    });

  });

  describe("debugging", function() {
    it("should be able to debug one object if we want", function() {
      var buggy = new FieldDBObject();
      buggy.debugMode = true;
      expect(buggy.debugMode).toEqual(true);
      buggy.debug('This is some debug output', buggy, FieldDBObject);
      buggy.debugMode = false;
      console.log('It should say \' Done debugMode testing\' after this: ');
      buggy.debug('THERE WAS SOME OUTPUT', buggy, FieldDBObject);
      if (buggy.debugMode) {
        buggy.debugMode = true;
        buggy.debug('THIS IS SOME HEAVY STRINGIFICATION OUPUT THAT IS AVOIDED', JSON.stringify(buggy), JSON.stringify(FieldDBObject));
      }
      console.log(' Done debugMode testing');

      buggy.warn('This will print a warning', buggy);
      buggy.bug('This will print an warning in Nodejs');
      buggy.todo('This will print a todo', buggy);
      expect(buggy.toJSON().warnMessage).toBeUndefined();
      expect(buggy.toJSON().bugMesssage).toBeUndefined();
      expect(buggy.toJSON().todoMessage).toBeUndefined();
    });

  });
});
