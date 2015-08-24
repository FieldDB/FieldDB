var mapReduceFactory = require("./../../api/map_reduce/MapReduce").MapReduceFactory;
var frequentMapString = require("../../map_reduce_data/views/frequent/map").frequent;
var frequentReduceString = require("../../map_reduce_data/views/frequent/reduce").unique;

var FREQUENT_MAP_REDUCE = mapReduceFactory({
  filename: "frequent",
  mapString: frequentMapString,
  reduceString: frequentReduceString
});

var SAMPLE_GAME = require("../../sample_data/game_v2.24.0.json");
var specIsRunningTooLong = 5000;

describe("MapReduce frequent", function() {

  beforeEach(function() {
    FREQUENT_MAP_REDUCE.rows = [];
  });

  describe("load", function() {

    it("should load in a node context", function() {
      expect(mapReduceFactory).toBeDefined();
      expect(frequentMapString).toBeDefined();
    });

    it("should construct", function() {
      expect(FREQUENT_MAP_REDUCE).toBeDefined();
      expect(FREQUENT_MAP_REDUCE.emit).toBeDefined();
      expect(FREQUENT_MAP_REDUCE.map).toBeDefined();
      expect(FREQUENT_MAP_REDUCE.rows).toBeDefined();
    });

  });

  describe("emit", function() {

    it("should not emit deleted data", function() {
      FREQUENT_MAP_REDUCE.map({
        _id: "eiwomoae",
        trashed: "deleted12345"
      });
      expect(FREQUENT_MAP_REDUCE.rows.length).toEqual(0);
    });

    it("should reduce data", function() {
      expect(SAMPLE_GAME[0].results[1].results.length).toEqual(10);
      SAMPLE_GAME[0].results[1].results.map(FREQUENT_MAP_REDUCE.map);
      
      expect(FREQUENT_MAP_REDUCE.rows.length).toEqual(51);
      expect(FREQUENT_MAP_REDUCE.rows.map(function(row){
        return row.key
      })).toEqual(" ");

      var counts = FREQUENT_MAP_REDUCE.group();
      expect(counts.rows).toBeDefined();
      expect(counts.rows.length).toEqual(8);
      expect(counts.rows[0]).toEqual({ key : "Utterance", value : 10 });
      expect(counts.rows[1]).toEqual({ key : "Child", value : 8 });
      expect(counts.rows[2]).toEqual({ key : "NormalProduction", value : 5 });
      expect(counts.rows[3]).toEqual({ key : "CheckedWithFelicia", value : 10 });
      expect(counts.rows[4]).toEqual({ key : "Orthography", value : 10 });
      expect(counts.rows[5]).toEqual({ key : "AbnormalProduction", value : 5 });
      expect(counts.rows[6]).toEqual({ key : "Adult", value : 2 });
      expect(counts.rows[7]).toEqual({ key : "Male", value : 1 });
    });

  });

});
