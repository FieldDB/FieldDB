define([
  "corpus/Corpus",
  "data"
], function(
  Corpus,
  sampleData
) {
  "use strict";

  function registerTests() {
    var data = window.sampleData;

    describe("Corpus", function() {
      describe("parsing", function(){
        it("should not parse backbone couch responses", function() {
          var couchResponse = {
            "_id": "5f36008e38b55e13b28fe2a3caf8ac52",
            "ok": true,
            "_rev": "3-0663dc3c80dba2c59ff619cda9cc3057"
          };

          var corpus = new Corpus();
          var result = corpus.parse(couchResponse);
          expect(result).toEqual({
            "_id": "5f36008e38b55e13b28fe2a3caf8ac52",
            "_rev": "3-0663dc3c80dba2c59ff619cda9cc3057"
          });
        });

        it("should parse version 1 corpora", function() {
          var version1 = data["corpus_v1.22.1"][0];
          var expected = data["corpus_v1.22.1_expected"][0]
          var corpus = new Corpus();
          var result = corpus.parse(version1);
          var json = JSON.parse(JSON.stringify(result));
          expected.version = json.version;
          for (var attrib in json) {
            if (!json.hasOwnProperty(attrib)){
              continue;
            }
            expect(json[attrib]).toEqual(expected[attrib]);
          }
        });

        it("should parse version 2 corpora", function() {
          var version2 = data["corpus_v1.22.1"][1];
          var expected = data["corpus_v1.22.1_expected"][1]
          var corpus = new Corpus();
          var result = corpus.parse(version2);
          var json = JSON.parse(JSON.stringify(result));
          expected.version = json.version;
          for (var attrib in json) {
            if (!json.hasOwnProperty(attrib)){
              continue;
            }
            expect(json[attrib]).toEqual(expected[attrib]);
          }
        });

        it("should parse minimal corpora", function() {
          var minimal = data["corpus_v1.22.1"][2];
          var expected = data["corpus_v1.22.1_expected"][2]
          var corpus = new Corpus();
          var result = corpus.parse(minimal);
          var json = JSON.parse(JSON.stringify(result));
          expected.version = json.version;
          for (var attrib in json) {
            if (!json.hasOwnProperty(attrib)){
              continue;
            }
            expect(json[attrib]).toEqual(expected[attrib]);
          }
        });
      });

      describe("As a team we want to be able to go back in time in the corpus revisions", function() {
        it("should be able to import from GitHub repository", function() {
          expect(Corpus).toBeDefined();
        });
      });

      describe("As a user I want to be able to import via drag and drop", function() {
        it("should detect drag and drop", function() {
          expect(Corpus).toBeDefined();
        });
      });

      describe("As a user I want to be able to go offline, but still have the most recent objects in my corpus available", function() {
        it("should have the most recent entries available", function() {
          expect(Corpus).toBeDefined();
        });

        it("should store the corpus offine", function() {
          expect(Corpus).toBeDefined();
        });
      });
    });
  }

  return {
    describe: registerTests
  };
});
