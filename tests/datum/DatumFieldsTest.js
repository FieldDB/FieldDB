'use strict';
var DatumFields = require('./../../api/datum/DatumFields').DatumFields;
var DatumField = require('./../../api/FieldDBObject').FieldDBObject;
var DEFAULT_CORPUS_MODEL = require("./../../api/corpus/corpus.json");

var sampleDatumFields = DEFAULT_CORPUS_MODEL.datumFields;

describe('lib/DatumFields', function() {

  it('should load', function() {
    expect(DatumFields).toBeDefined();
  });

  describe('construction options', function() {
    var collection;

    beforeEach(function() {
      console.log("beforeEach");
      collection = new DatumFields({
        inverted: true,
        primaryKey: 'id',
        collection: [sampleDatumFields[0], sampleDatumFields[2]],
        INTERNAL_MODELS: {
          item: DatumField
        }
      });
    });

    it('should construct using options', function() {
      expect(collection).toBeDefined();
    });

    it('should accept a primary key', function() {
      expect(collection.primaryKey).toEqual('id');
    });

    it('should use the primary key for find', function() {
      expect(collection.find('utterance')[0].id).toEqual(sampleDatumFields[2].id);
    });

    it('should accept inverted', function() {
      expect(collection.collection[0].id).toEqual(sampleDatumFields[2].id);
    });

    it('should accept model of items to be defined', function() {
      // expect(collection.utterance.constructor).toEqual(Object);
      expect(collection.utterance.constructor).toEqual(DatumField);
    });

  });

  describe('array-like construction', function() {

    it('should permit constrution with just an array', function() {
      var newcollection = new DatumFields([
        sampleDatumFields[0],
        sampleDatumFields[1]
      ]);
      expect(newcollection.length).toEqual(2);
    });

  });

  describe('filling', function() {
    var collection;

    beforeEach(function() {
      collection = new DatumFields({
        inverted: true,
        primaryKey: 'id'
      });

      collection.add(sampleDatumFields[0]);
      collection.add(sampleDatumFields[2]);
    });

    it('should be able to add items', function() {
      expect(collection.length).toBe(2);
    });

    it('should permit push to add to the bottom', function() {
      collection.push(sampleDatumFields[3]);
      expect(collection.collection[2]).toEqual(sampleDatumFields[3]);
    });

    it('should permit unshift to add to the top', function() {
      collection.unshift(sampleDatumFields[4]);
      expect(collection.collection[0]).toEqual(sampleDatumFields[4]);
    });

  });

  describe('acessing contents', function() {
    var collection;

    beforeEach(function() {
      collection = new DatumFields({
        primaryKey: 'id',
        collection: sampleDatumFields
      });
      collection.utterance.value = "Noqata tusunayawanmi";
      collection.morphemes.value = "Noqa-ta tusu-naya-wa-n-mi";
      collection.translation.value = "I feel like dancing.";
    });

    it('should seem like an object by providing dot notation for primaryKeys ', function() {
      expect(collection.utterance.id).toEqual('utterance');
    });

    it('should return undefined for items which are not in the collection', function() {
      expect(collection.phonetic).toBeUndefined();
    });

    it('should be able to find items by primary key', function() {
      expect(collection.find('utterance')[0].labelLinguists).toEqual('Utterance');
    });

    it('should be able to find items by any attribute', function() {
      expect(collection.find('help', 'What was said/written using the alphabet/writing system of the language.')[0].id).toEqual(sampleDatumFields[1].id);
    });

    it('should accpet a RegExp to find items', function() {
      expect(collection.find('type', /(tags|parallelText)/i).map(function(item) {
        return item.labelLinguists;
      })).toEqual(['Orthography', 'Utterance', 'Translation', 'Tags', 'Data validity/verification Status']);
    });

    it('should be able to fuzzy find items by any attribute', function() {
      expect(collection.fuzzyFind('value', 'nay').map(function(item) {
        return item.labelLinguists;
      })).toEqual(['Utterance', 'Morphemes']);
    });
  });

  describe('non-lossy persistance', function() {
    var collection,
      collectionToLoad = [{
        id: 'a',
        type: 'tags'
      }, {
        id: 'z',
        value: 'somethign\n with a line break',
        type: 'wiki'
      }, {
        id: 'c',
        type: 'date'
      }];

    beforeEach(function() {
      collection = new DatumFields({
        collection: collectionToLoad,
        aHellperFunction: function() {
          console.log('called');
        }
      });
      collection.anotherHelperFunction = function() {
        console.log('called');
      };
    });

    it('should seem like an array when serialized using both the canonical JSON.stringify', function() {
      var asStringified = JSON.stringify(collection);
      // console.log(asStringified);
      expect(JSON.parse(asStringified)[2].type).toEqual('date');
      expect(asStringified).toEqual(JSON.stringify(collectionToLoad));
    });

    it('should seem not loose information when serialized and reloaded', function() {
      var collectionFromDB = JSON.stringify(collection);
      collection = new DatumFields({
        collection: JSON.parse(collectionFromDB)
      });
      expect(collection.toJSON()).toEqual(collectionToLoad);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(collectionToLoad));
    });

    it('should seem to not loose information when toJSONed and reloaded', function() {
      var collectionFromDB = collection.toJSON();
      expect(collectionFromDB[2].id).toEqual('c');
      expect(collectionFromDB).toEqual(collectionToLoad);

      var collectionReloaded = new DatumFields({
        collection: collectionFromDB
      });

      expect(JSON.stringify(collectionReloaded)).toEqual(JSON.stringify(collectionFromDB));
    });

  });

});
