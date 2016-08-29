"use strict";
var ComputationalLinguisticsCorpus;
try {
  /* globals FieldDB */
  if (FieldDB) {
    ComputationalLinguisticsCorpus = FieldDB.ComputationalLinguisticsCorpus;
  }
} catch (e) {}

ComputationalLinguisticsCorpus = ComputationalLinguisticsCorpus || require("./../../api/corpus/ComputationalLinguisticsCorpus").ComputationalLinguisticsCorpus;

describe("ComputationalLinguisticsCorpus", function() {
  it("should be load", function() {
    expect(ComputationalLinguisticsCorpus).toBeDefined();
    var corpus = new ComputationalLinguisticsCorpus();
    expect(corpus).toBeDefined();
  });

  describe("stats", function() {
    it("should calcuate stats of a datalist", function() {
      var corpus = new ComputationalLinguisticsCorpus({
        // debugMode: true
      });
      var stats = corpus.extractStats({
        docs: [
          new ComputationalLinguisticsCorpus.DEFAULT_DATUM({
            fields: [{
              id: "orthography",
              value: "ხო"
            }]
          }),
          new ComputationalLinguisticsCorpus.DEFAULT_DATUM({
            fields: [{
              id: "orthography",
              value: "ირემი  ცხპვრობს  ჩრდილოეთში."
            }]
          })
        ]
      });

      corpus.debug("stats result", stats);
      expect(stats).toEqual({
        characters: {
          unigrams: {
            ხ: 2,
            ო: 3,
            ი: 4,
            რ: 3,
            ე: 2,
            მ: 1,
            " ": 4,
            ც: 1,
            პ: 1,
            ვ: 1,
            ბ: 1,
            ს: 1,
            ჩ: 1,
            დ: 1,
            ლ: 1,
            თ: 1,
            შ: 1,
            ".": 1
          },
          bigrams: {}
        },
        words: {
          unigrams: {
            "ხო": 1,
            "ირემი": 1,
            "ცხპვრობს": 1,
            "ჩრდილოეთში.": 1
          },
          bigrams: {}
        },
        tokens: {
          characters: {
            unigrams: 30,
            bigrams: 0
          },
          words: {
            unigrams: 4,
            bigrams: 0
          }
        },
        types: {
          characters: {
            unigrams: 18,
            bigrams: 0
          },
          words: {
            unigrams: 4,
            bigrams: 0
          }
        },
        ttr: {
          characters: {
            unigrams: 1.6666666666666667,
            bigrams: 1
          },
          words: {
            unigrams: 1,
            bigrams: 1
          }
        }
      });
    });

    it("should use utterance to calculate stats of a datalist", function() {
      var corpus = new ComputationalLinguisticsCorpus({
        // debugMode: true
      });
      var stats = corpus.extractStats({
        docs: [
          new ComputationalLinguisticsCorpus.DEFAULT_DATUM({
            fields: [{
              id: "orthography",
              value: "ხო"
            }, {
              id: "utterance",
              value: "xo"
            }]
          }),
          new ComputationalLinguisticsCorpus.DEFAULT_DATUM({
            fields: [{
              id: "orthography",
              value: "ირემი  ცხპვრობს  ჩრდილოეთში."
            }, {
              id: "utterance",
              value: "iremi  tsxrvobs  tʃrdloetʃi."
            }]
          })
        ]
      });

      corpus.debug("stats result", stats);
      expect(stats).toEqual({
        characters: {
          unigrams: {
            x: 2,
            o: 3,
            i: 3,
            r: 3,
            e: 2,
            m: 1,
            " ": 4,
            t: 3,
            s: 2,
            v: 1,
            b: 1,
            ʃ: 2,
            d: 1,
            l: 1,
            ".": 1
          },
          bigrams: {}
        },
        words: {
          unigrams: {
            xo: 1,
            iremi: 1,
            tsxrvobs: 1,
            "tʃrdloetʃi.": 1
          },
          bigrams: {}
        },
        tokens: {
          characters: {
            unigrams: 30,
            bigrams: 0
          },
          words: {
            unigrams: 4,
            bigrams: 0
          }
        },
        types: {
          characters: {
            unigrams: 15,
            bigrams: 0
          },
          words: {
            unigrams: 4,
            bigrams: 0
          }
        },
        ttr: {
          characters: {
            unigrams: 2,
            bigrams: 1
          },
          words: {
            unigrams: 1,
            bigrams: 1
          }
        }
      });
    });
  });
});
