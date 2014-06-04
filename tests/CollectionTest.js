'use strict';

var Collection = require('../api/Collection').Collection;

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
          var notText = this.isNot ? ' not' : '';

          this.message = function () {
            return 'Expected ' + actual + notText + ' to be less than ' + expected;
          }

          return actual < expected;
        }

      });
    });

*/
var sampleCollection = [{
  label: "utterance",
  labelMachine: "utterance",
  help: "What was said/written",
  value: "Noqata tusunayawanmi",
  mask: "Noqata tusunayawanmi",
  helpLinguist: "Line 1 in examples for handouts (ie, either Orthography, or phonemic/phonetic representation)"
}, {
  label: "translation",
  labelMachine: "translation",
  value: "I feel like dancing.",
  mask: "I feel like dancing.",
  help: "Free translation into whatever language the corpus team chooses",
  language: "en",
  helpLinguist: "Morpheme segmentation"
}, {
  label: "morphemes",
  labelMachine: "morphemes",
  value: "Noqa-ta tusu-naya-wa-n-mi",
  mask: "Noqa-ta tusu-naya-wa-n-mi",
  help: "Words divided into prefixes, root and suffixes",
  helpLinguist: "Morpheme segmentation"
}];

describe('lib/Collection', function() {

  it('should load', function() {
    expect(Collection).toBeDefined();
  });

  describe('construction options', function() {
    var collection;

    beforeEach(function() {
      collection = new Collection({
        inverted: true,
        primaryKey: 'label'
      });

      collection.add(sampleCollection[0]);
      collection.add(sampleCollection[1]);
    });

    it('should accept a primary key', function() {
      expect(collection.primaryKey).toEqual('label');
    });

    it('should use the primary key', function() {
      expect(collection.find('utterance')[0]).toEqual(sampleCollection[0]);
    });

    it('should accept inverted', function() {
      expect(collection.collection[0]).toEqual(sampleCollection[1]);
    });

    it('should permit push to add to the bottom', function() {
      collection.push(sampleCollection[2]);
      expect(collection.collection[2]).toEqual(sampleCollection[2]);
    });

    it('should permit unshift to add to the top', function() {
      collection.unshift(sampleCollection[2]);
      expect(collection.collection[0]).toEqual(sampleCollection[2]);
    });

    it('should permit constrution with just an array', function() {
      var newcollection = new Collection([
        sampleCollection[0],
        sampleCollection[1]
      ]);
      expect(collection.length).toEqual(2);
    });

  });

  describe('acessing contents', function() {
    var collection;

    beforeEach(function() {
      collection = new Collection({
        primaryKey: 'label',
        collection: sampleCollection
      });
    });

    it('should seem like an object by providing dot notation for primaryKeys ', function() {
      expect(collection.utterance).toEqual(sampleCollection[0]);
    });

    it('should return undefined for items which are not in the collection', function() {
      expect(collection.gloss).toBeUndefined();
    });

    it('should be able to find items by primary key', function() {
      expect(collection.find('utterance')).toEqual([sampleCollection[0]]);
    });

    it('should be able to find items by any attribute', function() {
      expect(collection.find('help', 'What was said/written')).toEqual([sampleCollection[0]]);
    });

    it('should accpet a RegExp to find items', function() {
      expect(collection.find('help', /(written|translation)/i)).toEqual([sampleCollection[0], sampleCollection[1]]);
    });

    it('should be able to fuzzy find items by any attribute', function() {
      expect(collection.fuzzyFind('value', 'nay')).toEqual([sampleCollection[0], sampleCollection[2]]);
    });
  });

  describe('non-lossy persistance', function() {
    var collection,
      collectionToLoad = [{
        _id: 'a',
        type: 'datum'
      }, {
        _id: 'z',
        type: 'datum'
      }, {
        _id: 'c',
        type: 'datum'
      }];

    beforeEach(function() {
      collection = new Collection({
        collection: collectionToLoad,
        aHellperFunction: function() {
          console.log('called');
        }
      });
      collection.anotherHelperFunction = function() {
        console.log('called');
      };
    });

    it('should seem like an array when serialized', function() {
      expect(collection.toJSON()).toEqual(collectionToLoad);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(collectionToLoad));
    });

    it('should seem not loose information when serialized and reloaded', function() {
      var collectionFromDB = JSON.stringify(collection);
      collection = new Collection({
        collection: JSON.parse(collectionFromDB)
      })
      expect(collection.toJSON()).toEqual(collectionToLoad);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(collectionToLoad));
    });

    it('should seem not loose information when toJSONed and reloaded', function() {
      var collectionFromDB = collection.toJSON();
      collection = new Collection({
        collection: collectionFromDB
      })
      expect(collection.toJSON()).toEqual(collectionToLoad);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(collectionToLoad));
    });

  });

});
