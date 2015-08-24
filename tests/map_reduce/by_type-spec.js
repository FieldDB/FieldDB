var mapReduceFactory = require("./../../api/map_reduce/MapReduce").MapReduceFactory;
var byTypeMapString = require("../../map_reduce_data/views/by_type/map").byType;

var BY_TYPE_MAP_REDUCE = mapReduceFactory({
  filename: "byType",
  mapString: byTypeMapString
});

var SAMPLE_DATA = require("../../sample_data/datum_v1.22.1.json");
var SAMPLE_CORPORA = require("../../sample_data/corpus_v1.22.1.json");
var SAMPLE_DATALISTS = require("../../sample_data/datalist_v1.22.1.json");
var SAMPLE_SESSIONS = require("../../sample_data/session_v1.22.1.json");
var SAMPLE_GAMIFY_DATA = require("../../sample_data/gamify_v2.2.0.json");
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
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[0].toString()).toEqual("Wed Sep 26 2012 10:13:03 GMT-0400 (EDT)");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[1]).toEqual("D3DE2F48-451F-4E1D-809C-AD5D9D7D8120");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[2].toString()).toEqual("Wed Sep 26 2012 09:51:49 GMT-0400 (EDT)");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[3]).toEqual("Jaunpa much'asqami kani.");
    });

    it("should emit a preview of title if its a corpus", function() {
      BY_TYPE_MAP_REDUCE.map(SAMPLE_CORPORA[0]);
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(1);
      expect(BY_TYPE_MAP_REDUCE.rows[0].key).toEqual("Corpus");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[0]).toEqual(0);
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[1]).toEqual("60B9B35A-A6E9-4488-BBF7-CB54B09E87C1");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[2]).toEqual(0);
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[3]).toEqual("Sample Corpus");
    });

    it("should emit a preview of title if its a datalist", function() {
      BY_TYPE_MAP_REDUCE.map(SAMPLE_DATALISTS[0]);
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(2);
      expect(BY_TYPE_MAP_REDUCE.rows[0].key).toEqual("DataList");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[0].toString()).toEqual("Wed Sep 26 2012 10:42:56 GMT-0400 (EDT)");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[1]).toEqual("81B7D6F7-5ED0-4935-8E90-E9523AA3B391");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[2].toString()).toEqual("Wed Sep 26 2012 10:37:51 GMT-0400 (EDT)");
      expect(BY_TYPE_MAP_REDUCE.rows[0].value[3]).toEqual("morphemes:nay AND gl...rch result");
    });

    it("should emit a preview of comments", function() {
      BY_TYPE_MAP_REDUCE.map(SAMPLE_DATALISTS[0]);
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

  describe("support data v1.22", function() {

    it("should emit a preview of first field if its a session", function() {
      expect(SAMPLE_GAMIFY_DATA.length).toEqual(4);
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(0);

      SAMPLE_GAMIFY_DATA.map(BY_TYPE_MAP_REDUCE.map);

      expect(BY_TYPE_MAP_REDUCE.rows).toBeDefined();
      expect(BY_TYPE_MAP_REDUCE.rows.length).toEqual(1);
    });
  });
});
