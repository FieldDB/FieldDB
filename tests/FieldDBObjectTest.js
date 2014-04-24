var FieldDBObject = require("../api/FieldDBObject").FieldDBObject;


describe("FieldDBObject", function() {
	xit("should accept a json object", function() {
		var u = new FieldDBObject();
		u.aproperty = "hasavalue";
		expect(u.aproperty).toEqual("hasavalue");

		u = new FieldDBObject({
			aproperty: "adifferentvalue"
		});
		expect(u.aproperty).toEqual("adifferentvalue");
	});
	it("should accept a json object on extended classes", function() {
		
		var Child =  function Child(options) {
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
});
