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
      SAMPLE_GAME[0].results.map(FREQUENT_MAP_REDUCE.map);

      expect(FREQUENT_MAP_REDUCE.rows.length).toEqual(101);
      // expect(FREQUENT_MAP_REDUCE.rows.map(function(row){
      //   return row.key
      // })).toEqual(" ");

      var counts = FREQUENT_MAP_REDUCE.group();
      expect(counts.rows).toBeDefined();
      expect(counts.rows.length).toEqual(3);
      expect(counts.rows[0]).toEqual({
        key: "ResponseFields",
        value: ['Utterance:::20', 'Orthography:::20']
      });
      expect(counts.rows[1]).toEqual({
        key: "Tag",
        value: ['NormalProduction:::15', 'Adult:::12', 'Child:::8', 'AbnormalProduction:::5', 'Male:::1']
      });
      expect(counts.rows[2]).toEqual({
        key: "ValidationStatus",
        value: ['CheckedWithFelicia:::20']
      });
    });

  });

});
