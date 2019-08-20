var mapReduceFactory = require("./../../api/map_reduce/MapReduce").MapReduceFactory;
var byUserModifiedMapString = require("../../map_reduce_data/views/by_session_or_user/map").byUserModified;

var BY_USER_MAP_REDUCE = mapReduceFactory({
  filename: "byUserModified",
  mapString: byUserModifiedMapString
});

var SAMPLE_DATA = JSON.parse(JSON.stringify(require("../../sample_data/datum_v1.22.1.json")));
// var specIsRunningTooLong = 5000;

describe("MapReduce by_session_or_user", function() {

  beforeEach(function() {
    BY_USER_MAP_REDUCE.rows = [];
  });

  describe("load", function() {

    it("should load in a node context", function() {
      expect(mapReduceFactory).toBeDefined();
      expect(byUserModifiedMapString).toBeDefined();
    });

    it("should construct", function() {
      expect(BY_USER_MAP_REDUCE).toBeDefined();
      expect(BY_USER_MAP_REDUCE.emit).toBeDefined();
      expect(BY_USER_MAP_REDUCE.map).toBeDefined();
      expect(BY_USER_MAP_REDUCE.rows).toBeDefined();
    });

  });

  describe("emit data by user", function() {

    it("should not emit deleted data", function() {
      BY_USER_MAP_REDUCE.map({
        _id: "eiwomoae",
        trashed: "deleted12345"
      });
      expect(BY_USER_MAP_REDUCE.rows.length).toEqual(0);
    });


    it("should emit unkwown if no user is on the data", function() {
      BY_USER_MAP_REDUCE.map({
        _id: "eiwomoaewe",
        dbname: "sapir-firstcorpus",
        fieldDBtype: "Datum",
        fields: [{
          id: "utterance",
          mask: "one blue "
        }]
      });
      expect(BY_USER_MAP_REDUCE.rows.length).toEqual(1);
      expect(BY_USER_MAP_REDUCE.rows[0].key).toEqual("unknown");
      expect(BY_USER_MAP_REDUCE.rows[0].value[0]).toEqual(0);
      expect(BY_USER_MAP_REDUCE.rows[0].value[1]).toEqual("eiwomoaewe");
      expect(BY_USER_MAP_REDUCE.rows[0].value[2]).toEqual(0);
      expect(BY_USER_MAP_REDUCE.rows[0].value[3]).toEqual("one blue ");
    });

  });

  describe("support data v1.22", function() {

    it("should have a preview", function() {
      expect(SAMPLE_DATA[0].session._id).toEqual("763568EE-BB24-48D2-BEAD-D46E22D11418");
      expect(SAMPLE_DATA[1].session._id).toEqual("f840a6c3f41393f4ab2f1cff25000bf2");

      SAMPLE_DATA.map(BY_USER_MAP_REDUCE.map);
      expect(BY_USER_MAP_REDUCE.rows.length).toEqual(SAMPLE_DATA.length * 2);

      expect(BY_USER_MAP_REDUCE.rows[0].key).toEqual("sapir");

      expect(SAMPLE_DATA[0].dateModified).toEqual("\"2012-09-26T14:13:03.928Z\"");
      expect(BY_USER_MAP_REDUCE.rows[0].value[0].toString()).toContain("Wed Sep 26 2012 10:13:03");

      expect(SAMPLE_DATA[0].dateEntered).toEqual("\"2012-09-26T13:51:49.463Z\"");
      expect(BY_USER_MAP_REDUCE.rows[0].value[2].toString()).toContain("Wed Sep 26 2012 09:51:49");

      expect(BY_USER_MAP_REDUCE.rows[0].value[1]).toEqual(SAMPLE_DATA[0]._id);
      expect(BY_USER_MAP_REDUCE.rows[0].value[3]).toEqual("Jaunpa much'asqami kani.");

      expect(BY_USER_MAP_REDUCE.rows[1].key).toEqual(SAMPLE_DATA[0].session._id);
      expect(BY_USER_MAP_REDUCE.rows[1].value[0].toString()).toEqual(BY_USER_MAP_REDUCE.rows[0].value[2].toString());
      expect(BY_USER_MAP_REDUCE.rows[1].value[1]).toEqual(BY_USER_MAP_REDUCE.rows[0].value[1]);
      expect(BY_USER_MAP_REDUCE.rows[1].value[2].toString()).toEqual(BY_USER_MAP_REDUCE.rows[0].value[0].toString());
      expect(BY_USER_MAP_REDUCE.rows[1].value[3]).toEqual(BY_USER_MAP_REDUCE.rows[0].value[3]);

      expect(BY_USER_MAP_REDUCE.rows[2].key).toEqual("testingspreadsheet");

      expect(SAMPLE_DATA[1].dateModified).toEqual(1428030685907);
      expect(BY_USER_MAP_REDUCE.rows[2].value[0].toString()).toContain("Sat Jan 03 2015 01:29:36");

      expect(SAMPLE_DATA[1].dateEntered).toEqual("2014-12-13T10:21:27.777Z");
      expect(BY_USER_MAP_REDUCE.rows[2].value[2].toString()).toContain("Sat Jan 03 2015 01:29:36");

      expect(BY_USER_MAP_REDUCE.rows[2].value[1]).toEqual("af3e7eaca2f20158c2a89c7da704c1a5");
      expect(BY_USER_MAP_REDUCE.rows[2].value[3]).toEqual("testing audio upload details come back");

      expect(BY_USER_MAP_REDUCE.rows[3].key).toEqual(SAMPLE_DATA[1].session._id);
      expect(BY_USER_MAP_REDUCE.rows[3].value[0].toString()).toEqual(BY_USER_MAP_REDUCE.rows[2].value[2].toString());
      expect(BY_USER_MAP_REDUCE.rows[3].value[1]).toEqual(BY_USER_MAP_REDUCE.rows[2].value[1]);
      expect(BY_USER_MAP_REDUCE.rows[3].value[2].toString()).toContain("Thu Apr 02 2015 23:11:25");
      expect(BY_USER_MAP_REDUCE.rows[3].value[3]).toEqual(BY_USER_MAP_REDUCE.rows[2].value[3]);
    });

  });

  describe("support gamify data", function() {});
});
