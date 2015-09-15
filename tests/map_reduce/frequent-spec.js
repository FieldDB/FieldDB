var CORS = require("../../api/CORSNode").CORS;

var mapReduceFactory = require("./../../api/map_reduce/MapReduce").MapReduceFactory;
var frequentMapString = require("../../map_reduce_data/views/frequent/map").frequent;
var frequentReduceString = require("../../map_reduce_data/views/frequent/reduce").groupedCount;
var specIsRunningTooLong = 5000;

var FREQUENT_MAP_REDUCE = mapReduceFactory({
  filename: "frequent",
  mapString: frequentMapString,
  reduceString: frequentReduceString
});

var SAMPLE_GAME = require("../../sample_data/game_v2.24.0.json");
// var specIsRunningTooLong = 5000;

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
        value: [{
          key: "Utterance",
          value: 20
        }, {
          key: "Orthography",
          value: 20
        }]
      });
      expect(counts.rows[1]).toEqual({
        key: "Tag",
        value: [{
          key: "NormalProduction",
          value: 15
        }, {
          key: "Adult",
          value: 12
        }, {
          key: "Child",
          value: 8
        }, {
          key: "AbnormalProduction",
          value: 5
        }, {
          key: "Male",
          value: 1
        }]
      });
      expect(counts.rows[2]).toEqual({
        key: "ValidationStatus",
        value: [{
          key: "CheckedWithFelicia",
          value: 20
        }]
      });
    });

  });


  xdescribe("serverside", function() {
    it("should run serverside", function(done) {
      var server = "http://localhost:5984";
      var url = server + "/testinglexicon-kartuli/_design/data/_view/" + FREQUENT_MAP_REDUCE.filename + "?group=true";
      console.log("requesting server side run of map reduce to see if out put has changed " + url);

      CORS.makeCORSRequest({
          type: "GET",
          url: url
        }).then(function(results) {
            expect(results).toBeDefined();
            expect(results.rows).toBeDefined();
            expect(results.rows.length).toEqual(4);
            expect(results.rows[0].key).toEqual("DatumFields");
            expect(results.rows[0].value.length).toEqual(10);
            expect(results.rows[0].value[0].key).toEqual("Utterance");
            expect(results.rows[0].value[0].value).toEqual(70);
            expect(results.rows[0].value[1].key).toEqual("Translation");
            expect(results.rows[0].value[1].value).toEqual(60);
            expect(results.rows[0].value[2].key).toEqual("Morphemes");
            expect(results.rows[0].value[2].value).toEqual(58);
            expect(results.rows[0].value[3].key).toEqual("Orthography");
            expect(results.rows[0].value[3].value).toEqual(58);
            expect(results.rows[0].value[4].key).toEqual("Gloss");
            expect(results.rows[0].value[4].value).toEqual(52);
            expect(results.rows[0].value[5].key).toEqual("Context");
            expect(results.rows[0].value[5].value).toEqual(43);
            expect(results.rows[0].value[6].key).toEqual("EnteredByUser");
            expect(results.rows[0].value[6].value).toEqual(7);
            expect(results.rows[0].value[7].key).toEqual("SyntacticCategory");
            expect(results.rows[0].value[7].value).toEqual(3);
            expect(results.rows[0].value[8].key).toEqual("Audio");
            expect(results.rows[0].value[8].value).toEqual(3);
            expect(results.rows[0].value[9].key).toEqual("SyntacticTreeLatex");
            expect(results.rows[0].value[9].value).toEqual(1);

            expect(results.rows[1].key).toEqual("SessionFields");
            expect(results.rows[1].value.length).toEqual(1);
            expect(results.rows[1].value[0].key).toEqual("Goal");
            expect(results.rows[1].value[0].value).toEqual(1);

            expect(results.rows[2].key).toEqual("Tag");
            expect(results.rows[2].value.length).toEqual(2);
            expect(results.rows[2].value[0].key).toEqual("SampleData");
            expect(results.rows[2].value[0].value).toEqual(10);

            expect(results.rows[3].key).toEqual("ValidationStatus");
            expect(results.rows[3].value.length).toEqual(10);
            expect(results.rows[3].value[0].key).toEqual("Checked");
            expect(results.rows[3].value[0].value).toEqual(43);
            expect(results.rows[3].value[1].key).toEqual("ToBeChecked");
            expect(results.rows[3].value[1].value).toEqual(10);
            expect(results.rows[3].value[2].key).toEqual("CheckedWithGoogleTranslate");
            expect(results.rows[3].value[2].value).toEqual(6);
            expect(results.rows[3].value[3].key).toEqual("CheckedWithMenu");
            expect(results.rows[3].value[3].value).toEqual(6);
            expect(results.rows[3].value[4].key).toEqual("CheckedWithGirl1");
            expect(results.rows[3].value[4].value).toEqual(4);
            expect(results.rows[3].value[5].key).toEqual("ToBeCheckedForNaturalness");
            expect(results.rows[3].value[5].value).toEqual(3);
            expect(results.rows[3].value[6].key).toEqual("ElicitedWithGirl3");
            expect(results.rows[3].value[6].value).toEqual(2);
            expect(results.rows[3].value[7].key).toEqual("ToBeElicited");
            expect(results.rows[3].value[7].value).toEqual(2);
            expect(results.rows[3].value[8].key).toEqual("CheckedWithGirl2");
            expect(results.rows[3].value[8].value).toEqual(1);
            expect(results.rows[3].value[9].key).toEqual("Deleted");
            expect(results.rows[3].value[9].value).toEqual(1);
          },
          function(reason) {
            expect(reason).toBeUndefined();
          })
        .fail(function(error) {
          expect(error).toBeUndefined();
        })
        .done(done);

    }, specIsRunningTooLong);
  });

});
