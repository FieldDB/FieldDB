'use strict';

var Collection = require('../api/Collection').Collection;
var DEFAULT_DATUM_VALIDATION_STATI = require("./../api/datum/validation-status.json");
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

describe('lib/Collection', function() {

  it('should load', function() {
    expect(Collection).toBeDefined();
  });

  describe('construction options', function() {
    var collection;

    beforeEach(function() {
      collection = new Collection({
        inverted: true,
        primaryKey: 'validationStatus'
      });

      collection.add(DEFAULT_DATUM_VALIDATION_STATI[0]);
      collection.add(DEFAULT_DATUM_VALIDATION_STATI[1]);
    });

    it('should accept a primary key', function() {
      expect(collection.primaryKey).toEqual('validationStatus');
    });

    it('should use the primary key to get members using dot notation', function() {
      expect(collection.Published_).toEqual(DEFAULT_DATUM_VALIDATION_STATI[1]);
    });

    it('should accept inverted', function() {
      expect(collection.collection[0]).toEqual(DEFAULT_DATUM_VALIDATION_STATI[1]);
    });

    it('should permit push to add to the bottom', function() {
      collection.push(DEFAULT_DATUM_VALIDATION_STATI[2]);
      expect(collection.collection[2]).toEqual(DEFAULT_DATUM_VALIDATION_STATI[2]);
    });

    it('should permit unshift to add to the top', function() {
      collection.unshift(DEFAULT_DATUM_VALIDATION_STATI[2]);
      expect(collection.collection[0]).toEqual(DEFAULT_DATUM_VALIDATION_STATI[2]);
    });

    it('should permit constrution with just an array', function() {
      var newcollection = new Collection([{
        id: 'a',
        type: 'tags'
      }, {
        id: 'z',
        value: 'somethign\n with a line break',
        type: 'wiki'
      }, {
        id: 'c',
        type: 'date'
      }]);
      expect(newcollection.length).toEqual(3);
    });

  });

  describe('acessing contents', function() {
    var collection;

    beforeEach(function() {
      collection = new Collection({
        primaryKey: 'validationStatus',
        collection: DEFAULT_DATUM_VALIDATION_STATI
      });
    });

    it('should seem like an object by providing dot notation for primaryKeys ', function() {
      expect(collection.Checked_).toEqual(DEFAULT_DATUM_VALIDATION_STATI[0]);
    });

    it('should seem like an object by providing case insensitive cleaned dot notation for primaryKeys ', function() {
      expect(collection.checked).toEqual(DEFAULT_DATUM_VALIDATION_STATI[0]);
    });

    it('should return undefined for items which are not in the collection', function() {
      expect(collection.Removed).toBeUndefined();
    });

    it('should be able to find items by primary key', function() {
      expect(collection.find('Checked*')).toEqual([DEFAULT_DATUM_VALIDATION_STATI[0]]);
    });

    it('should be able to find items by primary key using a regex', function() {
      collection.add({
        validationStatus: 'CheckedBySeberina',
        color: 'green'
      })
      expect(collection.find(/^Checked*/)).toEqual([DEFAULT_DATUM_VALIDATION_STATI[0], {
        validationStatus: 'CheckedBySeberina',
        color: 'green'
      }]);
    });

    it('should be able to find items by any attribute', function() {
      expect(collection.find('color', 'green')).toEqual([{
        validationStatus: 'Checked*',
        color: 'green',
        default: true
      }, {
        validationStatus: 'ApprovedLanguageLearningContent*',
        color: 'green',
        showInLanguageLearnignApps: true
      }]);
    });

    it('should accpet a RegExp to find items', function() {
      expect(collection.find('color', /(red|black)/i)).toEqual([{
        validationStatus: 'Deleted*',
        color: 'red',
        showInSearchResults: false,
        showInLanguageLearnignApps: false
      }, {
        validationStatus: 'Duplicate*',
        color: 'red',
        showInSearchResults: false,
        showInLanguageLearnignApps: false
      }]);
    });

    /*TODO chagne this to 'ren' once we have fuzzy find for real */
    it('should be able to fuzzy find items by any attribute', function() {
      expect(collection.fuzzyFind('color', 'r.*n')).toEqual([{
        validationStatus: 'Checked*',
        color: 'green',
        default: true
      }, {
        validationStatus: 'ToBeChecked*',
        color: 'orange'
      }, {
        validationStatus: 'ApprovedLanguageLearningContent*',
        color: 'green',
        showInLanguageLearnignApps: true
      }, {
        validationStatus: 'ContributedLanguageLearningContent*',
        color: 'orange'
      }]);
    });
  });

  describe('non-lossy persistance', function() {
    var collection,
      collectionToLoad = [{
        id: 'a',
        type: 'datum'
      }, {
        id: 'z',
        type: 'datum'
      }, {
        id: 'c',
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
