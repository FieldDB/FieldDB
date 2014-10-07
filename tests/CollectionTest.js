"use strict";

var Collection = require("../api/Collection").Collection;
var FieldDBObject = require("../api/FieldDBObject").FieldDBObject;
var DEFAULT_DATUM_VALIDATION_STATI = require("./../api/datum/validation-status.json");

var specIsRunningTooLong = 5000;

/*
  ======== A Handy Little Jasmine Reference ========
https://github.com/pivotal/jasmine/wiki/Matchers

  Spec matchers:
    expect(x).toEqual(y); compares objects or primitives x and y and passes if they are equivalent
    expect(x).toBe(y); compares objects or primitives x and y and passes if they are the same object
    expect(x).toMatch(pattern); compares x to string or regular expression pattern and passes if they match
    expect(x).toBeDefined(); passes if x is not undefined
    expect(x).toBeUndefined(); passes if x is undefined
    expect(x).toBeNull(); passes if x is null
    expect(x).toBeTruthy(); passes if x evaluates to true
    expect(x).toBeFalsy(); passes if x evaluates to false
    expect(x).toContain(y); passes if array or string x contains y
    expect(x).toBeLessThan(y); passes if x is less than y
    expect(x).toBeGreaterThan(y); passes if x is greater than y
    expect(function(){fn();}).toThrow(e); passes if function fn throws exception e when executed

    Every matcher's criteria can be inverted by prepending .not:
    expect(x).not.toEqual(y); compares objects or primitives x and y and passes if they are not equivalent

    Custom matchers help to document the intent of your specs, and can help to remove code duplication in your specs.
    beforeEach(function() {
      this.addMatchers({

        toBeLessThan: function(expected) {
          var actual = this.actual;
          var notText = this.isNot ? " not" : "";

          this.message = function () {
            return "Expected " + actual + notText + " to be less than " + expected;
          }

          return actual < expected;
        }

      });
    });

*/
var useDefaults = function() {
  return JSON.parse(JSON.stringify(DEFAULT_DATUM_VALIDATION_STATI));
};

describe("lib/Collection", function() {

  it("should load", function() {
    expect(Collection).toBeDefined();
  });

  describe("construction options", function() {
    var collection;

    beforeEach(function() {
      collection = new Collection({
        inverted: true,
        primaryKey: "validationStatus",
        capitalizeFirstCharacterOfPrimaryKeys: true
      });

      collection.add(useDefaults()[0]);
      collection.add(useDefaults()[1]);
    });

    it("should accept a primary key", function() {
      expect(collection.primaryKey).toEqual("validationStatus");
    });

    it("should use the primary key to get members using dot notation", function() {
      expect(collection.Published).toEqual(useDefaults()[1]);
      expect(collection.published).toEqual(useDefaults()[1]);
    });

    it("should accept inverted", function() {
      expect(collection.collection[0]).toEqual(useDefaults()[1]);
    });

    it("should permit push to add to the bottom", function() {
      collection.push(useDefaults()[2]);
      expect(collection.collection[2]).toEqual(useDefaults()[2]);
    });

    it("should permit unshift to add to the top", function() {
      collection.unshift(useDefaults()[2]);
      expect(collection.collection[0]).toEqual(useDefaults()[2]);
    });

    it("should permit constrution with just an array", function() {
      var newcollection = new Collection([{
        id: "a",
        type: "tags"
      }, {
        id: "z",
        value: "somethign\n with a line break",
        type: "wiki"
      }, {
        id: "c",
        type: "date"
      }]);
      expect(newcollection.length).toEqual(3);
    });

  });

  describe("acessing contents", function() {
    var collection;

    beforeEach(function() {
      collection = new Collection({
        primaryKey: "validationStatus",
        collection: useDefaults(),
        capitalizeFirstCharacterOfPrimaryKeys: true
      });
      // collection.debugMode = true;
    });

    it("should seem like an object by providing dot notation for primaryKeys ", function() {
      expect(collection.Checked).toEqual(useDefaults()[0]);
    });

    it("should seem like an object by providing case insensitive cleaned dot notation for primaryKeys ", function() {
      expect(collection.checked).toEqual(useDefaults()[0]);
    });

    it("should return undefined for items which are not in the collection", function() {
      expect(collection.Removed).toBeUndefined();
    });

    it("should be able to find items by primary key", function() {
      expect(collection.find("Checked*")).toEqual([useDefaults()[0]]);
    });

    it("should be return an empty array if nothing was searched for", function() {
      expect(collection.find("")).toEqual([]);
    });

    it("should be return an empty array if nothing was searched for", function() {
      expect(collection.find({})).toEqual([]);
    });

    it("should be able to find items by primary key using a regex", function() {
      collection.add({
        validationStatus: "CheckedBySeberina",
        color: "green"
      });
      expect(collection.find(/^Checked*/)).toEqual([useDefaults()[0], {
        validationStatus: "CheckedBySeberina",
        color: "green"
      }]);
    });

    it("should be able to find items by any attribute", function() {
      expect(collection.find("color", "green")).toEqual([{
        validationStatus: "Checked*",
        color: "green",
        default: true
      }, {
        validationStatus: "ApprovedLanguageLearningContent*",
        color: "green",
        showInLanguageLearnignApps: true
      }]);
    });

    it("should accpet a RegExp to find items", function() {
      expect(collection.find("color", /(red|black)/i)).toEqual([{
        validationStatus: "Deleted*",
        color: "red",
        showInSearchResults: false,
        showInLanguageLearnignApps: false
      }, {
        validationStatus: "Duplicate*",
        color: "red",
        showInSearchResults: false,
        showInLanguageLearnignApps: false
      }]);
    });

    /*TODO chagne this to "ren" once we have fuzzy find for real */
    it("should be able to fuzzy find items by any attribute", function() {
      expect(collection.fuzzyFind("color", "r.*n")).toEqual([{
        validationStatus: "Checked*",
        color: "green",
        default: true
      }, {
        validationStatus: "ToBeChecked*",
        color: "orange"
      }, {
        validationStatus: "ApprovedLanguageLearningContent*",
        color: "green",
        showInLanguageLearnignApps: true
      }, {
        validationStatus: "ContributedLanguageLearningContent*",
        color: "orange"
      }]);
    });

    it("should be able to clone an existing collection", function() {
      var newbarecollection = collection.clone();
      expect(newbarecollection).toEqual(useDefaults());
      var newcollection = new Collection({
        primaryKey: "validationStatus",
        collection: newbarecollection
      });
      newcollection.checked = {
        validationStatus: "Checked",
        color: "blue"
      };
      expect(collection.checked).toEqual(useDefaults()[0]);
      expect(newcollection.checked).not.toEqual(useDefaults()[0]);
      expect(collection.checked).not.toEqual(newcollection.checked);
    });

    it("should provide map on its internal collection", function() {
      expect(collection.map).toBeDefined();
      expect(collection.map(function(item) {
        return item.validationStatus;
      })).toEqual(["Checked*", "Published*", "ToBeChecked*", "ApprovedLanguageLearningContent*", "ContributedLanguageLearningContent*", "Deleted*", "Duplicate*"]);
    });

  });

  describe("cleaning contents", function() {
    var collection,
      item,
      item2,
      item3;

    beforeEach(function() {
      collection = new Collection({
        // debugMode: true,
        primaryKey: "name",
        collection: [, new FieldDBObject({
          name: "chicken",
          difference: "lowercase"
        }), new FieldDBObject({
          name: "chicken",
          difference: "lowercase"
        }), new FieldDBObject({
          name: "_chicken_",
          difference: "underscores"
        }), new FieldDBObject({
          name: "CHICKEN",
          difference: "uppercase and after chicken"
        }), new FieldDBObject({
          name: "duck"
        }), new FieldDBObject({
          name: "pigeon"
        }), new FieldDBObject({
          name: "turkey"
        })],
        capitalizeFirstCharacterOfPrimaryKeys: true
      });
      // collection.debugMode = true;
      item = collection.CHICKEN;
      item2 = collection.chicken;
      item3 = collection.pigeon;
    });

    it("should not set/complain about setting an object to itself.", function() {
      var duck = collection._collection[3];
      expect(duck).toBeDefined();
      expect(collection.duck).toEqual(duck);


      collection.set("duck", duck);
      expect(collection.duck).toEqual(duck);
      expect(collection.warnMessage).not.toContain("Overwriting an existing collection member duck (they have the same key but are not equal nor the same object)");

    });


    it("should not set/complain about setting an equivalent object to itself.", function() {
      var duck = collection._collection[3];
      expect(duck).toBeDefined();
      expect(collection.duck).toEqual(duck);

      collection.set("duck", new FieldDBObject({
        name: "duck",
      }));
      expect(collection.duck).toEqual(duck);
      expect(collection.warnMessage).not.toContain("Overwriting an existing _collection member duck ");

    });


    it("should complain about setting a non equivalent object to itself.", function() {
      var duck = collection._collection[3];
      expect(duck).toBeDefined();
      expect(collection.duck).toEqual(duck);

      collection.set("duck", new FieldDBObject({
        name: "duck",
        feet: "yellow"
      }));
      expect(collection.duck).toEqual(duck);
      expect(collection.warnMessage).toContain("Overwriting an existing _collection member duck at index 3 (they have the same key but are not equal, nor the same object)");

    });


    it("should work for collections with primary key clashes", function() {
      expect(collection).toBeDefined();
      expect(collection.warnMessage).toContain("The sanitized the dot notation key of this object is not the same as its primaryKey: chicken -> Chicken");
      expect(collection.warnMessage).not.toContain("Not setting Chicken, it already the same in the collection");
      expect(collection.warnMessage).toContain("The sanitized the dot notation key of this object is not the same as its primaryKey: _chicken_ -> Chicken");
      expect(collection.warnMessage).toContain("The sanitized the dot notation key of this object is not the same as its primaryKey: duck -> Duck");
      expect(collection.warnMessage).toContain("The sanitized the dot notation key of this object is not the same as its primaryKey: pigeon -> Pigeon");
      expect(collection.warnMessage).toContain("The sanitized the dot notation key of this object is not the same as its primaryKey: turkey -> Turkey");
      expect(collection.find("difference", "lowercase")[0].difference).toEqual("lowercase");
      expect(collection.find("difference", "underscores")[0].difference).toEqual("underscores");
      expect(collection.length).toBe(6);
      expect(item).toBeDefined();
      expect(item.difference).toBe("uppercase and after chicken");
      expect(item2).toBeDefined();
      expect(item2.difference).toBe("uppercase and after chicken");
      expect(collection.collection[0].difference).toEqual("lowercase");
      expect(collection.collection[1].difference).toEqual("underscores");
      expect(collection.collection[2].difference).toEqual("uppercase and after chicken");
      expect(item3).toBeDefined();
    });

    it("should give the index of a item", function() {
      expect(collection.indexOf).toBeDefined();

      expect(item).toBeDefined();
      expect(collection.indexOf(item)).toBe(2);
      expect(collection.collection[collection.indexOf(item)]).toBe(item);
      expect(collection.indexOf(item2)).toBe(2);
      expect(collection.collection[collection.indexOf(item2)]).toBe(item2);
      expect(collection.indexOf(item3)).toBe(4);
      expect(collection.collection[collection.indexOf(item3)]).toBe(item3);
    });

    it("should give the index of a simple object", function() {
      expect(collection.indexOf(item.toJSON())).toBe(2);
      expect(collection.indexOf(item.toJSON())).toBe(2);
      expect(collection.collection[collection.indexOf(item.toJSON())]).toBe(item);
      expect(collection.indexOf(item2.toJSON())).toBe(2);
      expect(collection.collection[collection.indexOf(item2.toJSON())]).toBe(item2);
      expect(collection.indexOf(item3.toJSON())).toBe(4);
      expect(collection.collection[collection.indexOf(item3.toJSON())]).toBe(item3);
    });

    it("should give the index using only the primary key", function() {
      expect(collection.indexOf("chicken")).toBe(2);
      expect(collection.indexOf("chicken")).toBe(2);
      expect(collection.collection[collection.indexOf("chicken")]).toBe(item);
      expect(collection.indexOf("duck")).toBe(3);
      expect(collection.indexOf("pigeon")).toBe(4);
      expect(collection.collection[collection.indexOf("pigeon")]).toBe(item3);
    });

    it("should be possible to reorder items by index", function() {
      expect(collection.reorder).toBeDefined();
      expect(collection.collection[2].name).toBe("CHICKEN");
      expect(collection.collection[3].name).toBe("duck");
      expect(collection.collection[4].name).toBe("pigeon");

      collection.reorder(4, 2);

      expect(collection.collection[0].name).toBe("chicken");
      expect(collection.collection[1].name).toBe("_chicken_");
      expect(collection.collection[2].name).toBe("pigeon");
      expect(collection.collection[3].name).toBe("CHICKEN");
      expect(collection.collection[4].name).toBe("duck");
      expect(collection.collection[5].name).toBe("turkey");

    });

    it("should be possible to reorder items using a bare object", function() {

      expect(collection.collection[0].name).toBe("chicken");
      expect(collection.collection[1].name).toBe("_chicken_");
      expect(collection.collection[2].name).toBe("CHICKEN");
      expect(collection.collection[3].name).toBe("duck");
      expect(collection.collection[4].name).toBe("pigeon");
      expect(collection.collection[5].name).toBe("turkey");

      collection.reorder(collection.collection[5].toJSON(), 0);

      expect(collection.collection[0].name).toBe("turkey");
      expect(collection.collection[1].name).toBe("chicken");
      expect(collection.collection[2].name).toBe("_chicken_");
      expect(collection.collection[3].name).toBe("CHICKEN");
      expect(collection.collection[4].name).toBe("duck");
      expect(collection.collection[5].name).toBe("pigeon");

    });

    it("should be possible to reorder items using an object", function() {

      expect(collection.collection[0].name).toBe("chicken");
      expect(collection.collection[1].name).toBe("_chicken_");
      expect(collection.collection[2].name).toBe("CHICKEN");
      expect(collection.collection[3].name).toBe("duck");
      expect(collection.collection[4].name).toBe("pigeon");
      expect(collection.collection[5].name).toBe("turkey");

      collection.reorder(collection.collection[5], 0);

      expect(collection.collection[0].name).toBe("turkey");
      expect(collection.collection[1].name).toBe("chicken");
      expect(collection.collection[2].name).toBe("_chicken_");
      expect(collection.collection[3].name).toBe("CHICKEN");
      expect(collection.collection[4].name).toBe("duck");
      expect(collection.collection[5].name).toBe("pigeon");

    });

    xit("should be possible to remove an item", function() {
      // collection.debugMode = true;
      var chicken = collection.collection[1];
      expect(chicken.name).toEqual("_chicken_");
      expect(collection.length).toEqual(6);

      var removedOne = collection.remove(chicken);
      expect(collection.length).toEqual(5);
      expect(removedOne).toEqual([chicken]);
      expect(collection.removedCollection).toEqual([chicken]);
      expect(collection.warnMessage).not.toContain("One of the requested removal items dont match what was removed");
      var uppercasechicken = collection.collection[1];
      expect(uppercasechicken.name).toEqual("CHICKEN");
      expect(collection.length).toEqual(5);

      removedOne = collection.remove(uppercasechicken);
      expect(collection.length).toEqual(4);
      expect(removedOne).toEqual([uppercasechicken]);
      expect(collection.removedCollection).toEqual([chicken, uppercasechicken]);

      expect(collection.length).toEqual(4);
      removedOne = collection.remove(chicken);
      expect(collection.length).toEqual(4);
      expect(collection.warnMessage).not.toContain("One of the requested removal items dont match what was removed");

      // expect(chicken).toEqual( " ");
      expect(collection.warnMessage).toContain("Didn't remove object(s) which were not in the collection.");
      expect(removedOne).toEqual([]);
      expect(collection.removedCollection).toEqual([chicken, uppercasechicken]);
      expect(collection.warnMessage).not.toContain("One of the requested removal items dont match what was removed");

      collection.warnMessage = "";
      expect(collection.warnMessage).not.toContain("Didn't remove object(s) which were not in the collection.");
      expect(collection.remove({})).toEqual([]);
      expect(collection.warnMessage).toContain("Didn't remove object(s) which were not in the collection.");
      expect(collection.warnMessage).not.toContain("One of the requested removal items dont match what was removed");

      expect(collection.length).toEqual(4);
      removedOne = collection.remove(collection.duck);
      expect(collection.length).toEqual(3);
      expect(removedOne.length).toEqual(1);
      expect(removedOne[0].name).toEqual("duck");

    });

    it("should be possible to remove a simple object", function() {
      // collection.debugMode = true;
      var duck = collection.collection[3].toJSON();
      expect(duck.fieldDBtype).toEqual("FieldDBObject");
      expect(duck.name).toEqual("duck");
      expect(collection.length).toEqual(6);

      var removedOne = collection.remove(duck);
      expect(collection.length).toEqual(5);
      expect(removedOne.length).toEqual(1);
      expect(collection.warnMessage).toContain("One of the requested removal items dont match what was removed");
      expect(removedOne[0].name).toEqual(duck.name);
      expect(removedOne[0].difference).toEqual(duck.difference);

      var pigeon = collection.collection[3].toJSON();
      collection.warnMessage = "";
      expect(pigeon.name).toEqual("pigeon");
      expect(collection.length).toEqual(5);
      removedOne = collection.remove(pigeon);
      expect(collection.length).toEqual(4);
      expect(collection.warnMessage).toContain("One of the requested removal items dont match what was removed");

    });

    it("should be possible to remove objects matching a regular expression", function() {
      var removedAFew = collection.remove({
        name: /.*chicken.*/i
      });
      expect(removedAFew.length).toEqual(3);
      expect(removedAFew[0].name).toEqual("CHICKEN");
      expect(removedAFew[1].name).toEqual("_chicken_");
      expect(removedAFew[2].name).toEqual("chicken");

      expect(collection.length).toEqual(3);
      expect(collection.collection[0].name).toEqual("duck");
      expect(collection.collection[1].name).toEqual("pigeon");
      expect(collection.collection[2].name).toEqual("turkey");
    });


    it("should be possible to remove a primary key", function() {
      expect(collection.remove).toBeDefined();

      expect(collection.collection[0].name).toBe("chicken");
      expect(collection.collection[1].name).toBe("_chicken_");
      expect(collection.collection[2].name).toBe("CHICKEN");
      expect(collection.collection[3].name).toBe("duck");
      expect(collection.collection[4].name).toBe("pigeon");
      expect(collection.collection[5].name).toBe("turkey");

      var removedOne = collection.remove("chicken");
      expect(removedOne.length).toEqual(2);
      expect(removedOne[0].name).toEqual("CHICKEN");
      expect(removedOne[1].name).toEqual("chicken");

      removedOne = collection.remove("duck");
      expect(removedOne.length).toEqual(1);
      expect(removedOne[0].name).toEqual("duck");
      expect(collection.duck).toBeUndefined();
    });

    it("should be possible to remove multiple primary keys", function() {
      var removedOne = collection.remove(["duck", "pigeon"]);
      expect(removedOne.length).toEqual(2);
      expect(removedOne[0].name).toEqual("pigeon");
      expect(removedOne[1].name).toEqual("duck");
      expect(collection.warnMessage).not.toContain("One of the requested removal items dont match what was removed");
    });

    it("should be possible to remove multiple items", function() {
      var removedOne = collection.remove([collection.duck, collection.pigeon]);
      expect(removedOne.length).toEqual(2);
      expect(removedOne[0].name).toEqual("pigeon");
      expect(removedOne[1].name).toEqual("duck");
      expect(collection.warnMessage).not.toContain("One of the requested removal items dont match what was removed");
    });
  });


  describe("non-lossy persistance", function() {
    var collection,
      collectionToLoad = [{
        id: "a",
        type: "datum"
      }, {
        id: "z",
        type: "datum"
      }, {
        id: "c",
        type: "datum"
      }];

    beforeEach(function() {
      collection = new Collection({
        collection: collectionToLoad,
        aHellperFunction: function() {
          console.log("called");
        }
      });
      collection.anotherHelperFunction = function() {
        console.log("called");
      };
    });


    it("should have a type of Collection", function() {
      expect(collection.fieldDBtype).toEqual("Collection");
    });

    it("should seem like an array when serialized", function() {
      expect(collection.toJSON()).toEqual(collectionToLoad);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(collectionToLoad));
    });

    it("should seem not loose information when serialized and reloaded", function() {
      var collectionFromDB = JSON.stringify(collection);
      collection = new Collection({
        collection: JSON.parse(collectionFromDB)
      });
      expect(collection.toJSON()).toEqual(collectionToLoad);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(collectionToLoad));
    });

    it("should seem not loose information when toJSONed and reloaded", function() {
      var collectionFromDB = collection.toJSON();
      collection = new Collection({
        collection: collectionFromDB
      });
      expect(collection.toJSON()).toEqual(collectionToLoad);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(collectionToLoad));
    });

  });

  describe("confidentiality", function() {
    var collection;

    beforeEach(function() {
      collection = new Collection({
        primaryKey: "validationStatus",
        collection: useDefaults(),
        capitalizeFirstCharacterOfPrimaryKeys: true
      });
      // collection.debugMode = true;
    });

    it("should be able to set encrypted on members of a collection", function() {
      collection.encrypted = true;
      expect(collection.checked.encrypted).toEqual(true);
    });

    it("should be able to set confidential on members of a collection", function() {
      collection.confidential = {
        secretkey: "secretkey"
      };
      expect(collection.checked.confidential.secretkey).toEqual("secretkey");
    });
  });

  describe("merging", function() {
    var aBaseCollection;
    var atriviallyDifferentCollection;

    beforeEach(function() {
      aBaseCollection = new Collection([new FieldDBObject({
          id: "penguin",
          missingInNew: "hi"
        }), new FieldDBObject({
          id: "cuckoo"
        }), new FieldDBObject({
          id: "robin",
          externalObject: new FieldDBObject({
            internalString: "internal",
            internalTrue: true,
            internalEmptyString: "",
            internalFalse: false,
            internalNumber: 2,
            internalEqualString: "i'm a old property",
            // debugMode: true
          })
        }), new FieldDBObject({
          id: "cardinal"
        }), {
          id: "onlyinTarget"
        }, {
          id: "willBeOverwritten",
          missingInNew: "this isnt a FieldDBObject so it will be undefined after merge."
        },
        new FieldDBObject({
          id: "conflictingContents",
          conflicting: "in first collection"
        })
      ]);

      atriviallyDifferentCollection = new Collection([new FieldDBObject({
          id: "penguin"
        }), new FieldDBObject({
          id: "cuckoo",
          missingInOriginal: "hi there"
        }), {
          id: "willBeOverwritten",
          missingInOriginal: "this isnt a FieldDBObject so it will be fully overwritten."
        },
        new FieldDBObject({
          id: "robin",
          externalObject: new FieldDBObject({
            internalString: "internal is different",
            internalTrue: true,
            internalEmptyString: "",
            internalFalse: false,
            internalNumber: 2,
            internalEqualString: "i'm a old property",
            // debugMode: true
          })
        }), aBaseCollection.cardinal, {
          id: "onlyinNew"
        },
        new FieldDBObject({
          id: "conflictingContents",
          conflicting: "in second collection"
        })
      ]);

    });

    it("should be able to merge items in collections using their primary key", function() {
      expect(aBaseCollection.fieldDBtype).toEqual("Collection");
      expect(aBaseCollection.robin.fieldDBtype).toEqual("FieldDBObject");
      expect(aBaseCollection.onlyintarget).toBeDefined();
      expect(aBaseCollection._collection.length).toEqual(7);
      expect(aBaseCollection._collection.map(function(item) {
        return item.id;
      })).toEqual(["penguin", "cuckoo", "robin", "cardinal", "onlyinTarget", "willBeOverwritten", "conflictingContents"]);

      expect(atriviallyDifferentCollection.fieldDBtype).toEqual("Collection");
      expect(atriviallyDifferentCollection.robin.fieldDBtype).toEqual("FieldDBObject");
      expect(atriviallyDifferentCollection._collection.length).toEqual(7);
      expect(atriviallyDifferentCollection._collection.map(function(item) {
        return item.id;
      })).toEqual(["penguin", "cuckoo", "willBeOverwritten", "robin", "cardinal", "onlyinNew", "conflictingContents"]);

      // aBaseCollection.debugMode = true;
      var result = aBaseCollection.merge("self", atriviallyDifferentCollection, "overwrite");
      expect(result).toBe(aBaseCollection);
      // expect(aBaseCollection).toEqual(aBaseCollection);
      expect(aBaseCollection._collection.length).toEqual(8);
      expect(aBaseCollection._collection.map(function(item) {
        return item.id;
      })).toEqual(["penguin", "cuckoo", "robin", "cardinal", "onlyinTarget", "willBeOverwritten", "conflictingContents", "onlyinNew"]);

      expect(aBaseCollection.penguin.missingInNew).toEqual("hi");
      expect(aBaseCollection.cuckoo.missingInOriginal).toEqual("hi there");
      expect(aBaseCollection.conflictingcontents.conflicting).toEqual("in second collection");
      expect(aBaseCollection.robin.externalObject.internalString).toEqual("internal is different");
      expect(aBaseCollection.robin.externalObject.internalTrue).toEqual(true);
      expect(aBaseCollection.robin.externalObject.internalEmptyString).toEqual("");
      expect(aBaseCollection.robin.externalObject.internalFalse).toEqual(false);
      expect(aBaseCollection.robin.externalObject.internalNumber).toEqual(2);
      expect(aBaseCollection.robin.externalObject.internalEqualString).toEqual("i'm a old property");

      expect(aBaseCollection.cardinal).toBeDefined();

      expect(aBaseCollection.onlyintarget).toBeDefined();
      expect(aBaseCollection.onlyinnew).toBeDefined();
      expect(aBaseCollection.willbeoverwritten).toBeDefined();
    });

    it("should be able to merge two collections in into a third collection", function() {
      expect(aBaseCollection.fieldDBtype).toEqual("Collection");
      expect(aBaseCollection.robin.fieldDBtype).toEqual("FieldDBObject");
      expect(aBaseCollection.onlyintarget).toBeDefined();
      expect(aBaseCollection._collection.length).toEqual(7);

      expect(atriviallyDifferentCollection.fieldDBtype).toEqual("Collection");
      expect(atriviallyDifferentCollection.robin.fieldDBtype).toEqual("FieldDBObject");
      expect(atriviallyDifferentCollection._collection.length).toEqual(7);

      var aThirdCollection = new Collection();
      var result = aThirdCollection.merge(aBaseCollection, atriviallyDifferentCollection, "overwrite");
      expect(result).toBe(aThirdCollection);
      expect(aThirdCollection._collection.length).toEqual(8);
      expect(aBaseCollection._collection.length).toEqual(7);
      expect(atriviallyDifferentCollection._collection.length).toEqual(7);

      expect(aThirdCollection).not.toEqual(aBaseCollection);
      expect(aThirdCollection).not.toEqual(atriviallyDifferentCollection);

      expect(aThirdCollection.penguin.missingInNew).toEqual("hi");
      expect(aThirdCollection.cuckoo.missingInOriginal).toEqual("hi there");
      expect(aThirdCollection.robin.externalObject.internalString).toEqual("internal is different");
      expect(aThirdCollection.robin.externalObject.internalTrue).toEqual(true);
      expect(aThirdCollection.robin.externalObject.internalEmptyString).toEqual("");
      expect(aThirdCollection.robin.externalObject.internalFalse).toEqual(false);
      expect(aThirdCollection.robin.externalObject.internalNumber).toEqual(2);
      expect(aThirdCollection.robin.externalObject.internalEqualString).toEqual("i'm a old property");

      expect(aThirdCollection.cardinal).toBeDefined();

      expect(aThirdCollection.onlyintarget).toBeDefined();
      expect(aThirdCollection.onlyinnew).toBeDefined();
      expect(aThirdCollection.willbeoverwritten).toBeDefined();
    });

    xit("should be able to merge two collections in into a third collection", function() {
      expect(aBaseCollection.fieldDBtype).toEqual("Collection");
      expect(aBaseCollection.robin.fieldDBtype).toEqual("FieldDBObject");
      expect(aBaseCollection.onlyintarget).toBeDefined();
      expect(aBaseCollection._collection.length).toEqual(7);

      expect(atriviallyDifferentCollection.fieldDBtype).toEqual("Collection");
      expect(atriviallyDifferentCollection.robin.fieldDBtype).toEqual("FieldDBObject");
      expect(atriviallyDifferentCollection._collection.length).toEqual(7);

      var aThirdCollection = aBaseCollection.merge(aBaseCollection, atriviallyDifferentCollection, "overwrite");
      expect(aThirdCollection._collection.length).toEqual(8);
      expect(aBaseCollection._collection.length).toEqual(7);
      expect(atriviallyDifferentCollection._collection.length).toEqual(7);

      expect(aThirdCollection).not.toEqual(aBaseCollection);
      expect(aThirdCollection).not.toEqual(atriviallyDifferentCollection);

      expect(aThirdCollection.penguin.missingInNew).toEqual("hi");
      expect(aThirdCollection.cuckoo.missingInOriginal).toEqual("hi there");
      expect(aThirdCollection.robin.externalObject.internalString).toEqual("internal is different");
      expect(aThirdCollection.robin.externalObject.internalTrue).toEqual(true);
      expect(aThirdCollection.robin.externalObject.internalEmptyString).toEqual("");
      expect(aThirdCollection.robin.externalObject.internalFalse).toEqual(false);
      expect(aThirdCollection.robin.externalObject.internalNumber).toEqual(2);
      expect(aThirdCollection.robin.externalObject.internalEqualString).toEqual("i'm a old property");

      expect(aThirdCollection.cardinal).toBeDefined();

      expect(aThirdCollection.onlyintarget).toBeDefined();
      expect(aThirdCollection.onlyinnew).toBeDefined();
      expect(aThirdCollection.willbeoverwritten).toBeDefined();
    });

    it("should be able to request confirmation for merging two collections into a third collection", function(done) {
      var result = aBaseCollection.merge("self", atriviallyDifferentCollection);
      expect(aBaseCollection.alwaysConfirmOkay).toBeFalsy();
      expect(atriviallyDifferentCollection.alwaysConfirmOkay).toBeFalsy();

      expect(result).toBeDefined();
      expect(result).toBe(aBaseCollection);
      expect(aBaseCollection._collection.length).toEqual(8);
      expect(aBaseCollection.confirmMessage).toContain("I found a conflict for willbeoverwritten, Do you want to overwrite it from {\"id\":\"willBeOverwritten\",\"missingInNew\":\"this isnt a FieldDBObject so it will be undefined after merge.\"} -> {\"id\":\"willBeOverwritten\",\"missingInOriginal\":\"this isnt a FieldDBObject so it will be fully overwritten.\"}");
      expect(aBaseCollection.conflictingcontents).toEqual(aBaseCollection._collection[6]);
      setTimeout(function() {
        expect(aBaseCollection.conflictingcontents.conflicting).toEqual("in first collection");
        done();
      }, 10);
      expect(aBaseCollection._collection.map(function(item) {
        return item.id;
      })).toEqual(["penguin", "cuckoo", "robin", "cardinal", "onlyinTarget", "willBeOverwritten", "conflictingContents", "onlyinNew"]);
      expect(aBaseCollection.conflictingcontents.confirmMessage).toContain("I found a conflict for conflicting, Do you want to overwrite it from \"in first collection\" -> \"in second collection\"");
      expect(aBaseCollection.robin.externalObject.confirmMessage).toContain("I found a conflict for internalString, Do you want to overwrite it from \"internal\" -> \"internal is different\"");
    }, specIsRunningTooLong);
  });
});
