var mapReduceFactory = require("./../../api/map_reduce/MapReduce").MapReduceFactory;
var byTypeMapString = require("../../map_reduce_data/views/by_type/map").byType;

var BY_TYPE_MAP_REDUCE = mapReduceFactory({
  filename: "byType",
  mapString: byTypeMapString
});

var SAMPLE_DATA = require("../../sample_data/datum_v1.22.1.json");
var SAMPLE_v1_CORPORA = require("../../sample_data/corpus_v1.22.1.json");
var SAMPLE_v3_CORPORA = [JSON.parse(JSON.stringify(require("../../api/corpus/corpus.json")))];
SAMPLE_v3_CORPORA[0].title = "DyslexDisorth";
SAMPLE_v3_CORPORA[0]._id = "32a4e729a4c1d2278bec26f69b067d4c";
SAMPLE_v3_CORPORA[0]._rev = "2-f720056a18626a5d01252ad8b1970ef7";
SAMPLE_v3_CORPORA[0].version = "v3.6.1";
SAMPLE_v3_CORPORA[0].fieldDBtype = "Corpus";
SAMPLE_v3_CORPORA[0].dateCreated = 1439925745602;

var SAMPLE_v1_DATALISTS = require("../../sample_data/datalist_v1.22.1.json");
var SAMPLE_v2_DATALISTS = require("../../sample_data/game_v2.24.0.json");

var SAMPLE_SESSIONS = require("../../sample_data/session_v1.22.1.json");
var SAMPLE_PARTICIPANTS = require("../../sample_data/participant_v2.32.0.json");
var SAMPLE_USER_MASK = require("../../sample_data/usermask_v3.6.1.json");
var SAMPLE_GAMIFY_DATA = [
  SAMPLE_USER_MASK[0],
  SAMPLE_PARTICIPANTS[0],
  SAMPLE_v3_CORPORA[0],
  SAMPLE_v2_DATALISTS[0]
];
var specIsRunningTooLong = 5000;

describe("MapReduce by_type", function() {

  beforeEach(function() {
    BY_TYPE_MAP_REDUCE.rows = [];
  });

  describe("load", function() {

    it("should load in a node context", function() {
      expect(mapReduceFactory).toBeDefined();
      expect(byTypeMapString).toBeDefined();
    });

    it("should construct", function() {
      expect(BY_TYPE_MAP_REDUCE).toBeDefined();
      expect(BY_TYPE_MAP_REDUCE.emit).toBeDefined();
      expect(BY_TYPE_MAP_REDUCE.map).toBeDefined();
      expect(BY_TYPE_MAP_REDUCE.rows).toBeDefined();
    });

  });

  describe("map on an array", function() {

    it("should run as map on an array", function() {
      [{
        _id: "anemptydoc"
      }].map(BY_TYPE_MAP_REDUCE.map);

      expect(BY_TYPE_MAP_REDUCE.rows).toBeDefined();
      expect(BY_TYPE_MAP_REDUCE.rows[0].key).toEqual(" skipping typeless doc");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[0]).toEqual(0);
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[1]).toEqual("anemptydoc");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[2]).toEqual(0);
      // expect(BY_TYPE_MAP_REDUCE.rows[0].value[3]).toEqual("");
    });


    it("should run reduce map on an array", function() {
      [{
        _id: "one"
      },{
        _id: "two"
      },{
        _id: "two"
      }].map(BY_TYPE_MAP_REDUCE.map);

      expect(BY_TYPE_MAP_REDUCE.rows).toBeDefined();
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(3);
      expect(BY_TYPE_MAP_REDUCE.rows[0].key).toEqual(" skipping typeless doc");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[0]).toEqual(0);
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[1]).toEqual("one");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[2]).toEqual(0);
      // expect(BY_TYPE_MAP_REDUCE.rows[0].value[3]).toEqual("");
    
      var results = BY_TYPE_MAP_REDUCE.group();
      expect(results).toBeDefined();
      expect(results.rows.length).toEqual(1);
      expect(results.rows[0].key).toEqual(" skipping typeless doc");
      expect(results.rows[0].value).toEqual(3);
    });
  });

  describe("custom emit", function() {

    it("should accept custom emit function and rows holder", function() {
      var rows = ["some previous stuff"];
      var emit = function(key, value) {
        rows.push({
          key: key,
          value: value,
          custom: "custom"
        });
      };

      BY_TYPE_MAP_REDUCE.customMap({
        _id: "8h329983jr200023j20",
        session: {
          _id: "98jo3io2qjoiwjesoij32",
          sessionFields: []
        },
        fields: [{
          id: "judgement",
          mask: ""
        }, {
          id: "utterance",
          mask: "Qaynap'unchaw lloqsinaywaran khunan p'unchaw(paq)"
        }]
      }, emit, rows);
      expect(rows).toBe(rows);
      expect(rows.length).toEqual(2);
      expect(rows[0]).toEqual("some previous stuff");
      expect(rows[1].key).toEqual("LanguageDatum");
      expect(rows[1].custom).toEqual("custom");
      expect(rows[1].value[0]).toEqual(0);
      expect(rows[1].value[1]).toEqual("8h329983jr200023j20");
      expect(rows[1].value[2]).toEqual(0);
      expect(rows[1].value[3]).toEqual("Qaynap'unchaw lloqsi...nchaw(paq)");
    });

  });

  describe("support data v1.22", function() {

    it("should emit a preview of second field if its a datum", function() {
      BY_TYPE_MAP_REDUCE.map(SAMPLE_DATA[0]);
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(1);
      expect(BY_TYPE_MAP_REDUCE.rows[0].key).toEqual("LanguageDatum");

      expect(SAMPLE_DATA[0].dateModified).toEqual("\"2012-09-26T14:13:03.928Z\"");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[0].toString()).toEqual("Wed Sep 26 2012 10:13:03 GMT-0400 (EDT)");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[1]).toEqual("D3DE2F48-451F-4E1D-809C-AD5D9D7D8120");

      expect(SAMPLE_DATA[0].dateEntered).toEqual("\"2012-09-26T13:51:49.463Z\"");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[2].toString()).toEqual("Wed Sep 26 2012 09:51:49 GMT-0400 (EDT)");

      expect(BY_TYPE_MAP_REDUCE.rows[0].value[3]).toEqual("Jaunpa much'asqami kani.");
    });

    it("should emit a preview of title if its a corpus", function() {
      BY_TYPE_MAP_REDUCE.map(SAMPLE_v1_CORPORA[0]);
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(1);
      expect(BY_TYPE_MAP_REDUCE.rows[0].key).toEqual("Corpus");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[0]).toEqual(0);
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[1]).toEqual("60B9B35A-A6E9-4488-BBF7-CB54B09E87C1");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[2]).toEqual(0);
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[3]).toEqual("Sample Corpus");
    });

    it("should emit a preview of title if its a datalist", function() {
      BY_TYPE_MAP_REDUCE.map(SAMPLE_v1_DATALISTS[0]);
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(2);
      expect(BY_TYPE_MAP_REDUCE.rows[0].key).toEqual("DataList");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[0].toString()).toEqual("Wed Sep 26 2012 10:42:56 GMT-0400 (EDT)");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[1]).toEqual("81B7D6F7-5ED0-4935-8E90-E9523AA3B391");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[2].toString()).toEqual("Wed Sep 26 2012 10:37:51 GMT-0400 (EDT)");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[3]).toEqual("morphemes:nay AND gl...rch result");
    });

    it("should emit a preview of title and participants if its an experiment datalist", function() {
      var simpleGameResult = {
        _id: "jumpgame",
        fieldDBtype: "SubExperimentDataList",
        participants: [{
          _id: "ALXD645210KI"
        }],
        experimenters: [{
          _id: "juliesmith"
        }, {
          _id: "manontee"
        }],
        title: {
          default: "Jump",
          locale_gamified_title: "Jump with us!"
        }
      };
      BY_TYPE_MAP_REDUCE.map(simpleGameResult);
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(1);
      expect(BY_TYPE_MAP_REDUCE.rows[0].key).toEqual("SubExperimentDataList");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[1]).toEqual("jumpgame");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[3]).toEqual("Jump (participants: ALXD645210KI) (experimenters: juliesmith, manontee)");
    });


    it("should emit a preview of comments", function() {
      BY_TYPE_MAP_REDUCE.map(SAMPLE_v1_DATALISTS[0]);
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(2);
      expect(BY_TYPE_MAP_REDUCE.rows[1].key).toEqual("Comment");
      expect(BY_TYPE_MAP_REDUCE.rows[1].value[0].toString()).toEqual("Wed Sep 26 2012 10:42:05 GMT-0400 (EDT)");
      expect(BY_TYPE_MAP_REDUCE.rows[1].value[1]).toEqual("81B7D6F7-5ED0-4935-8E90-E9523AA3B391/comment/1348670525349");
      expect(BY_TYPE_MAP_REDUCE.rows[1].value[2].toString()).toEqual("Wed Sep 26 2012 10:42:05 GMT-0400 (EDT)");
      expect(BY_TYPE_MAP_REDUCE.rows[1].value[3]).toEqual("Here is an example of how you can refine...onsultant on a particular morpheme/gloss");
    });

    it("should emit a preview of first field if its a session", function() {
      BY_TYPE_MAP_REDUCE.map(SAMPLE_SESSIONS[0]);
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(1);
      expect(BY_TYPE_MAP_REDUCE.rows[0].key).toEqual("Session");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[0].toString()).toEqual("Wed Sep 26 2012 10:42:56 GMT-0400 (EDT)");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[1]).toEqual("763568EE-BB24-48D2-BEAD-D46E22D11418");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[2].toString()).toEqual("Wed Sep 26 2012 09:51:49 GMT-0400 (EDT)");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[3]).toEqual("Collecting naya");
    });
  });

  describe("support gamify data", function() {
    var gamifyRows;

    it("should put aside gamifyRows for testing", function() {
      expect(SAMPLE_GAMIFY_DATA.length).toEqual(4);

      SAMPLE_GAMIFY_DATA.map(BY_TYPE_MAP_REDUCE.map);
      gamifyRows = BY_TYPE_MAP_REDUCE.rows;

      expect(gamifyRows.length).toEqual(66);
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(gamifyRows.length);
    });

    it("should support usermasks v3.6.1", function() {
      expect(SAMPLE_GAMIFY_DATA[0].fieldDBtype).toEqual("UserMask");
      expect(SAMPLE_GAMIFY_DATA[0].version).toEqual("v3.6.1");

      expect(gamifyRows[0].key).toEqual("UserMask");
      expect(gamifyRows[0].value[0]).toEqual(0);
      expect(gamifyRows[0].value[1]).toEqual("juliesmith");
      expect(gamifyRows[0].value[2]).toEqual(0);
      expect(gamifyRows[0].value[3]).toEqual(SAMPLE_GAMIFY_DATA[0].gravatar);
    });

    it("should support participants v2.32.0", function() {
      expect(SAMPLE_GAMIFY_DATA[1].fieldDBtype).toEqual("Participant");
      expect(SAMPLE_GAMIFY_DATA[1].version).toEqual("v2.32.0");
      expect(SAMPLE_GAMIFY_DATA[1].fields.length).toEqual(5);

      expect(gamifyRows[1].key).toEqual("Participant");
      expect(gamifyRows[1].value[0].toString()).toEqual("Tue Aug 18 2015 15:42:22 GMT-0400 (EDT)");
      expect(gamifyRows[1].value[1]).toEqual("ALXD645210KI");
      expect(gamifyRows[1].value[2].toString()).toEqual("Tue Aug 18 2015 15:42:22 GMT-0400 (EDT)");
      expect(gamifyRows[1].value[3]).toEqual("alxd645210ki");
    });

    it("should support corpora v3.6.1", function() {
      expect(SAMPLE_GAMIFY_DATA[2].fieldDBtype).toEqual("Corpus");
      expect(SAMPLE_GAMIFY_DATA[2].version).toEqual("v3.6.1");
      expect(SAMPLE_GAMIFY_DATA[2].speakerFields.length).toEqual(8);
      expect(SAMPLE_GAMIFY_DATA[2].datumFields.length).toEqual(16);
      expect(SAMPLE_GAMIFY_DATA[2].sessionFields.length).toEqual(10);

      expect(gamifyRows[2].key).toEqual("Corpus");
      expect(gamifyRows[2].value[0].toString()).toEqual("Tue Aug 18 2015 15:22:25 GMT-0400 (EDT)");
      expect(gamifyRows[2].value[1]).toEqual("32a4e729a4c1d2278bec26f69b067d4c");
      expect(gamifyRows[2].value[2].toString()).toEqual("Tue Aug 18 2015 15:22:25 GMT-0400 (EDT)");
      expect(gamifyRows[2].value[3]).toEqual("DyslexDisorth");
    });

    it("should support SubExperimentDataList v2.24.0", function() {

      expect(SAMPLE_GAMIFY_DATA[3].fieldDBtype).toEqual("SubExperimentDataList");
      expect(SAMPLE_GAMIFY_DATA[3].version).toEqual("v2.24.0");
      expect(SAMPLE_GAMIFY_DATA[3].results.length).toEqual(2);
      expect(SAMPLE_GAMIFY_DATA[3].results[0].reinforcementAnimation.animationImages.length).toEqual(11);
      expect(SAMPLE_GAMIFY_DATA[3].results[0].audioVideo.length).toEqual(27);
      expect(SAMPLE_GAMIFY_DATA[3].results[0].results.length).toEqual(10);

      expect(SAMPLE_GAMIFY_DATA[3].results[0].results[0].audioVideo.length).toEqual(1);
      expect(SAMPLE_GAMIFY_DATA[3].results[0].results[0].audioVideo[0].details.syllablesAndUtterances.scriptVersion).toEqual("v1.102.2");
      expect(SAMPLE_GAMIFY_DATA[3].results[0].results[0].images.length).toEqual(1);
      expect(SAMPLE_GAMIFY_DATA[3].results[0].results[0].session.sessionFields.length).toEqual(3);
      expect(SAMPLE_GAMIFY_DATA[3].results[0].results[0].responses.length).toEqual(1);
      expect(SAMPLE_GAMIFY_DATA[3].results[0].results[0].datumFields.length).toEqual(7);
      expect(SAMPLE_GAMIFY_DATA[3].results[0].results[0].datumFields[2].mask).toEqual("Adult, NormalProduction");

      expect(SAMPLE_GAMIFY_DATA[3].results[1].reinforcementAnimation.animationImages.length).toEqual(10);
      expect(SAMPLE_GAMIFY_DATA[3].results[1].audioVideo.length).toEqual(27);
      expect(SAMPLE_GAMIFY_DATA[3].results[1].results.length).toEqual(10);

      expect(SAMPLE_GAMIFY_DATA[3].results[1].results[0].audioVideo.length).toEqual(1);
      expect(SAMPLE_GAMIFY_DATA[3].results[1].results[0].audioVideo[0].details.syllablesAndUtterances.scriptVersion).toEqual("v1.102.2");
      expect(SAMPLE_GAMIFY_DATA[3].results[1].results[0].images.length).toEqual(1);
      expect(SAMPLE_GAMIFY_DATA[3].results[1].results[0].session.sessionFields.length).toEqual(3);
      expect(SAMPLE_GAMIFY_DATA[3].results[1].results[0].responses.length).toEqual(1);
      expect(SAMPLE_GAMIFY_DATA[3].results[1].results[0].datumFields.length).toEqual(7);
      expect(SAMPLE_GAMIFY_DATA[3].results[1].results[0].datumFields[2].mask).toEqual("Child,&nbsp;NormalProduction");

      expect(gamifyRows[3].key).toEqual("Response");
      expect(gamifyRows[3].value[0].toString()).toEqual("Mon Jul 14 2014 10:39:11 GMT-0400 (EDT)");
      expect(gamifyRows[3].value[1]).toEqual("1440170554221a999eaa0bf68ef3c6870c1f158491ab9");
      expect(gamifyRows[3].value[2].toString()).toEqual("Fri Aug 21 2015 11:22:34 GMT-0400 (EDT)");
      expect(gamifyRows[3].value[3]).toEqual("dʒəmp (Practice 1, score: 1)");

      expect(gamifyRows[4].key).toEqual("Image");
      expect(gamifyRows[4].value[0]).toEqual(0);
      expect(gamifyRows[4].value[1]).toEqual("jump.png");
      expect(gamifyRows[4].value[2]).toEqual(0);
      expect(gamifyRows[4].value[3]).toEqual("A depiction of a fro...ker did say 'jump').");

      expect(gamifyRows[5].key).toEqual("Audio");
      expect(gamifyRows[5].value[0].toString()).toEqual("Mon Jul 14 2014 10:04:37 GMT-0400 (EDT)");
      expect(gamifyRows[5].value[1]).toEqual("https://speechdev.example.org/jumprun-fr-ca/GR02A_jump__MOD.mp3");
      expect(gamifyRows[5].value[2]).toEqual(0);
      expect(gamifyRows[5].value[3]).toEqual(" Downloaded Praat Te... for GR02A_jump__MOD");

      expect(gamifyRows[3].value[3]).toEqual("dʒəmp (Practice 1, score: 1)");
      expect(gamifyRows[6].value[3]).toEqual("ni (Practice 2, score: 1)");
      expect(gamifyRows[9].value[3]).toEqual("dʒəmp (Practice 3, score: 1)");
      expect(gamifyRows[12].value[3]).toEqual("ni (Practice 4, score: 1)");
      expect(gamifyRows[15].value[3]).toEqual("ni (Practice 5, score: 1)");
      expect(gamifyRows[18].value[3]).toEqual("dʒəmp (Practice 6, score: 1)");
      expect(gamifyRows[21].value[3]).toEqual("dʒəmp (Practice 7, score: 1)");
      expect(gamifyRows[24].value[3]).toEqual("ni (Practice 8, score: 1)");
      expect(gamifyRows[27].value[3]).toEqual("ni (Practice 9, score: 1)");
      expect(gamifyRows[30].value[3]).toEqual("dʒəmp (Practice 10, score: 1)");

      expect(gamifyRows[33].key).toEqual("SubExperimentDataList");
      expect(gamifyRows[33].value[0].toString()).toEqual("Thu Sep 04 2014 18:45:13 GMT-0400 (EDT)");
      expect(gamifyRows[33].value[1]).toEqual("4e06b60e129dff5c7bb4bb234990b834");
      expect(gamifyRows[33].value[2].toString()).toEqual("Mon Jul 14 2014 10:39:11 GMT-0400 (EDT)");
      expect(gamifyRows[33].value[3]).toEqual("locale_practice");

      expect(gamifyRows[34].value[3]).toEqual("dʒəmp (Test 11, score: 1)");
      expect(gamifyRows[37].value[3]).toEqual("gi (Test 12, score: 1)");
      expect(gamifyRows[40].value[3]).toEqual("gji (Test 13, score: 0)");
      expect(gamifyRows[43].value[3]).toEqual("dʒəmp (Test 14, score: 1)");
      expect(gamifyRows[46].value[3]).toEqual("dʒəmp (Test 15, score: 1)");
      expect(gamifyRows[49].value[3]).toEqual("gi (Test 16, score: 1)");
      expect(gamifyRows[52].value[3]).toEqual("dʒəmp (Test 17, score: 1)");
      expect(gamifyRows[55].value[3]).toEqual("gi (Test 18, score: 1)");
      expect(gamifyRows[58].value[3]).toEqual("gi (Test 19, score: 1)");
      expect(gamifyRows[61].value[3]).toEqual("dʒəmp (Test 20, score: 1)");


      expect(gamifyRows[65].key).toEqual("SubExperimentDataList");
      expect(gamifyRows[65].value[0].toString()).toEqual("Fri Oct 10 2014 10:41:09 GMT-0400 (EDT)");
      expect(gamifyRows[65].value[1]).toEqual("32a4e729a4c1d2278bec26f69b29b7cd");
      expect(gamifyRows[65].value[2].toString()).toEqual("Fri Aug 21 2015 11:21:45 GMT-0400 (EDT)");
      expect(gamifyRows[65].value[3]).toEqual("locale_title (participants: LEBB720610PS) (experimenters: juliesmith)");

    });
  });
});
