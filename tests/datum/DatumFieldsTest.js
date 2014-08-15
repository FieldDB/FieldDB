'use strict';
var Confidential = require("./../../api/confidentiality_encryption/Confidential").Confidential;
var DatumField = require('./../../api/datum/DatumField').DatumField;
var DatumFields = require('./../../api/datum/DatumFields').DatumFields;
var DEFAULT_CORPUS_MODEL = require("./../../api/corpus/corpus.json");

var sampleDatumFields = function(){
  return JSON.parse(JSON.stringify(DEFAULT_CORPUS_MODEL.datumFields));
};

describe('lib/DatumFields', function() {

  it('should load', function() {
    expect(DatumFields).toBeDefined();
  });

  describe('construction options', function() {
    var collection;

    beforeEach(function() {
      // console.log("beforeEach");
      collection = new DatumFields({
        inverted: true,
        collection: [sampleDatumFields()[0], sampleDatumFields()[2]]
      });
    });

    it('should construct using options', function() {
      expect(collection).toBeDefined();
    });

    it('should accept a primary key', function() {
      expect(collection.primaryKey).toEqual('id');
    });

    it('should provide case insensitive lower and original case of a primary key', function() {

      collection = new DatumFields({
        collection: [{
          id: 'thisIsCamelCase'
        }]
      });
      // console.log(collection._collection);
      expect(collection.thisIsCamelCase).toBeDefined();
      expect(collection.thisiscamelcase).toBeDefined();
      expect(collection._collection.length).toEqual(1);
    });

    it('should use the primary key for find', function() {
      expect(collection.find('utterance')[0].id).toEqual(sampleDatumFields()[2].id);
    });

    it('should accept inverted', function() {
      expect(collection.collection[0].id).toEqual(sampleDatumFields()[2].id);
    });

    it('should accept model of items to be defined', function() {
      // expect(collection.utterance.constructor).toEqual(Object);
      expect(collection.utterance.constructor).toEqual(DatumField);
    });

    it("should turn the id into a camelCased safe value for use as property of an object, if it wasn't already", function() {
      var u = new DatumField();
      u.id = "Date Elicited";
      expect(u.id).toEqual('dateElicited');
      u.id = "utterance";
      expect(u.id).toEqual('utterance');
      u.id = "CheckedWithConsultant";
      expect(u.id).toEqual('checkedWithConsultant');
      u.id = "source/publication";
      expect(u.id).toEqual('sourcePublication');
      u.id = "a.field-with*dangerous characters (for import)";
      expect(u.id).toEqual('aFieldWithDangerousCharactersForImport');
      u.id = "Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ";
      expect(u.id).toEqual('internationalization');

    });

  });

  describe('array-like construction', function() {

    it('should permit construction with just an array', function() {
      var newcollection = new DatumFields([
        sampleDatumFields()[0],
        sampleDatumFields()[1]
      ]);
      expect(newcollection.length).toEqual(2);
    });

  });

  describe('filling', function() {
    var collection;

    beforeEach(function() {
      collection = new DatumFields({
        inverted: true
      });

      collection.add(sampleDatumFields()[0]);
      collection.add(sampleDatumFields()[2]);
    });

    it('should be able to add items', function() {
      expect(collection.length).toBe(2);
    });

    it('should permit push to add to the bottom', function() {
      collection.push(sampleDatumFields()[3]);
      expect(collection.collection[2]).toEqual(sampleDatumFields()[3]);
    });

    it('should permit unshift to add to the top', function() {
      collection.unshift(sampleDatumFields()[4]);
      expect(collection.collection[0]).toEqual(sampleDatumFields()[4]);
    });

  });

  describe('acessing contents', function() {
    var collection;

    beforeEach(function() {
      collection = new DatumFields({
        collection: sampleDatumFields()
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
      expect(collection.find('help', 'What was said/written using the alphabet/writing system of the language.')[0].id).toEqual(sampleDatumFields()[1].id);
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


    it('should be able to clone an existing collection', function() {
      var newbarecollection = collection.clone();
      // console.log(newbarecollection);
      // expect(newbarecollection).toEqual(sampleDatumFields());
      var newcollection = new DatumFields(newbarecollection);
      expect(newcollection.utterance.value).toEqual(collection.utterance.value);
      expect(newcollection.utterance.mask).toEqual(collection.utterance.mask);
      expect(newcollection.utterance.labelLinguists).toEqual(collection.utterance.labelLinguists);
      // expect(newcollection.utterance).toEqual(collection.utterance);
      expect(newcollection.utterance).not.toBe(collection.utterance);

      newcollection.utterance = {
        id: "utterance",
        color: "blue"
      };
      expect(newcollection.utterance).not.toEqual(collection.utterance);
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
      expect(collection.toJSON()[1].value).toEqual(collectionToLoad[1].value);
      expect(collection.toJSON()[1].mask).toEqual(collectionToLoad[1].mask);
      expect(collection.toJSON()[1].encrypted).toEqual(collectionToLoad[1].encrypted);
      // expect(JSON.stringify(collection)).toEqual(JSON.stringify(collectionToLoad)); //key ordering changed
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

  describe('confidentiality', function() {

    it('should set parese legacy shouldBeEncrypted \"\" and change from false to true', function() {
      var field = new DatumField({
        encrypted: "checked",
        help: "Grammaticality/acceptability judgement (*,#,?, etc). Leaving it blank can mean grammatical/acceptable, or you can choose a new symbol for this meaning.",
        label: "judgement",
        mask: "",
        shouldBeEncrypted: "",
        showToUserTypes: "linguist",
        size: "3",
        userchooseable: "disabled",
        value: ""
      });
      expect(field.shouldBeEncrypted).toEqual(undefined);
      field.shouldBeEncrypted = true;
      expect(field.shouldBeEncrypted).toBe(true);
    });

    it('should parse legacy shouldBeEncrypted checked', function() {
      var field = new DatumField({
        alternates: ["noqata tusu-nay-wanmi", "noqata tusunaywanmi"],
        encrypted: "",
        help: "Morpheme-segmented utterance in the language. Used by the system to help generate glosses (below). Can optionally appear below (or instead of) the first line in your LaTeXed examples. Sample entry: amig-a-s",
        label: "morphemes",
        mask: "noqa-ta tusu-nay-wa-n-mi",
        shouldBeEncrypted: "checked",
        showToUserTypes: "linguist",
        userchooseable: "disabled",
        value: "noqa-ta tusu-nay-wa-n-mi"
      });
      expect(field.shouldBeEncrypted).toBe(true);
    });

    it('should not permit to change shouldBeEncrypted from true to false', function() {
      var field = new DatumField({
        alternates: ["noqata tusu-nay-wanmi", "noqata tusunaywanmi"],
        encrypted: "",
        help: "Morpheme-segmented utterance in the language. Used by the system to help generate glosses (below). Can optionally appear below (or instead of) the first line in your LaTeXed examples. Sample entry: amig-a-s",
        label: "morphemes",
        mask: "noqa-ta tusu-nay-wa-n-mi",
        shouldBeEncrypted: "checked",
        showToUserTypes: "linguist",
        userchooseable: "disabled",
        value: "noqa-ta tusu-nay-wa-n-mi"
      });
      expect(field.shouldBeEncrypted).toBe(true);
      // field.debugMode = true;
      field.shouldBeEncrypted = false;
      expect(field.shouldBeEncrypted).toBe(true);
      expect(field.warnMessage).toBe("label is deprecated, instead use a label for appropriate user eg labelLinguists,  labelNonLinguists, labelTranslators, labelComputationalLinguist;;; userchooseable is deprecated, instead use defaultfield;;; This field's shouldBeEncrypted cannot be undone. Only a corpus administrator can change shouldBeEncrypted to false if it has been true before.");
    });

    it('should decript encrypted datum if in decryptedMode', function() {
      var field = new DatumField({
        alternates: ["noqata tusu-nay-wanmi", "noqata tusunaywanmi"],
        encrypted: "checked",
        help: "Morpheme-segmented utterance in the language. Used by the system to help generate glosses (below). Can optionally appear below (or instead of) the first line in your LaTeXed examples. Sample entry: amig-a-s",
        label: "morphemes",
        mask: "xxxx-xx xxxx-xxx-xx-x-xx",
        shouldBeEncrypted: "checked",
        showToUserTypes: "linguist",
        userchooseable: "disabled",
        value: "confidential:VTJGc2RHVmtYMThLQVdieUkxbmtlZEZ1d2h2RkMyTzF5MTFhMSt6Z2M5TmpYQVc0c3FpdGd5d1NJN1RHeG9qcg=="
      });
      // field.debugMode = true;
      // field.repairMissingEncryption = true;
      field.confidential = new Confidential({
        secretkey: "5e65e603-8d4e-4aea-9d68-64da15b081d5"
      });
      expect(field.value).toBe('xxxx-xx xxxx-xxx-xx-x-xx');
      field.decryptedMode = true;
      expect(field.value).toBe('noqa-ta tusu-nay-wa-n-mi');

      field.value = "noqa-ta tusu-nay-wan-mi ";
      expect(field.value).toBe('noqa-ta tusu-nay-wan-mi');

      field.decryptedMode = false;
      field.value = "noqa-ta tusu-nay-wan changed without access";
      expect(field.warnMessage).toEqual("label is deprecated, instead use a label for appropriate user eg labelLinguists,  labelNonLinguists, labelTranslators, labelComputationalLinguist;;; userchooseable is deprecated, instead use defaultfield;;; User is not able to view the value of this item, it is encrypted and the user isn't in decryptedMode.;;; User is not able to change the value of this item, it is encrypted and the user isn't in decryptedMode.");
      expect(field.value).toBe('xxxx-xx xxxx-xxx-xxx-xx');
      expect(field.warnMessage).toEqual("label is deprecated, instead use a label for appropriate user eg labelLinguists,  labelNonLinguists, labelTranslators, labelComputationalLinguist;;; userchooseable is deprecated, instead use defaultfield;;; User is not able to view the value of this item, it is encrypted and the user isn't in decryptedMode.;;; User is not able to change the value of this item, it is encrypted and the user isn't in decryptedMode.;;; User is not able to view the value of this item, it is encrypted and the user isn't in decryptedMode.");
      // console.log(field.toJSON());
    });

  });

  describe('confidentiality', function() {

    it('should be able to set an encrypter on any DatumField', function() {
      var doc = new DatumField();
      doc.confidential = {
        secretkey: 'secretkey'
      };
      expect(doc.confidential.secretkey).toEqual('secretkey');
    });
  });


  describe('confidentiality', function() {
    var fields;

    beforeEach(function() {
      fields = new DatumFields({
        inverted: true,
        collection: [sampleDatumFields()[0], sampleDatumFields()[2]]
      });
    });

    it('should be able to set encrypted on members of  datumfields', function() {
      fields.encrypted = true;
      // console.log(fields);
      expect(fields.judgement.encrypted).toEqual(true);
    });

    it('should be able to set confidential on members of a datumfields', function() {
      fields.confidential = {
        secretkey: 'secretkey'
      };
      fields.encrypted = true;
      fields.decryptedMode = true;

      expect(fields.judgement.confidential.secretkey).toEqual('secretkey');
      expect(fields.utterance.confidential.secretkey).toEqual('secretkey');
      expect(typeof fields.judgement.confidential.encrypt).toEqual('function');
      expect(typeof fields.utterance.confidential.encrypt).toEqual('function');
      fields.utterance.value = "hi";
      expect(fields.utterance.mask).toEqual('xx');
      fields.judgement.value = "*";
      expect(fields.judgement.mask).toEqual('*');
    });
  });
});
