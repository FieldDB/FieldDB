var Corpus = require("./Corpus").Corpus;
var ComputationalLinguisticsDatum = require("./../datum/ComputationalLinguisticsDatum").ComputationalLinguisticsDatum;

var ComputationalLinguisticsCorpus = function ComputationalLinguisticsCorpus(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "ComputationalLinguisticsCorpus";
  }
  this.debug("In ComputationalLinguisticsCorpus ", options);
  Corpus.DEFAULT_DATUM = ComputationalLinguisticsDatum;
  Corpus.apply(this, arguments);
};

ComputationalLinguisticsCorpus.DEFAULT_DATUM = ComputationalLinguisticsDatum;

ComputationalLinguisticsCorpus.prototype = Object.create(Corpus.prototype, /** @lends ComputationalLinguisticsCorpus.prototype */ {
  constructor: {
    value: ComputationalLinguisticsCorpus
  },

  extractStats: {
    value: function(datalist) {
      if (!datalist || !datalist.docs) {
        this.warn("datalist was empty", datalist);
        return datalist;
      }

      var stats = {
        characters: {
          unigrams: {},
          bigrams: {}
        },
        words: {
          unigrams: {},
          bigrams: {}
        },
        tokens: {
          characters: {
            unigrams: 0,
            bigrams: 0
          },
          words: {
            unigrams: 0,
            bigrams: 0
          }
        },
        types: {
          characters: {
            unigrams: 0,
            bigrams: 0
          },
          words: {
            unigrams: 0,
            bigrams: 0
          }
        },
        ttr: {
          characters: {
            unigrams: 1,
            bigrams: 1
          },
          words: {
            unigrams: 1,
            bigrams: 1
          }
        }
      };

      var item;
      var self = this;

      datalist.docs.map(function(doc) {
        if (!doc.stats && typeof doc.extractStats === "function") {
          doc.extractStats();
        }

        if (doc.stats.characters) {
          for (item in doc.stats.characters.unigrams) {
            if (!doc.stats.characters.unigrams.hasOwnProperty(item)) {
              continue;
            }
            stats.tokens.characters.unigrams = stats.tokens.characters.unigrams + doc.stats.characters.unigrams[item];

            // self.debug('character ' + item + doc.stats.characters.unigrams[item]);
            if (!stats.characters.unigrams[item]) {
              stats.types.characters.unigrams = stats.types.characters.unigrams + 1;
              stats.characters.unigrams[item] = doc.stats.characters.unigrams[item];
              continue;
            }
            stats.characters.unigrams[item] = stats.characters.unigrams[item] + doc.stats.characters.unigrams[item];
          }
        }
        if (doc.stats.words) {
          for (item in doc.stats.words.unigrams) {
            if (!doc.stats.words.unigrams.hasOwnProperty(item)) {
              continue;
            }
            stats.tokens.words.unigrams = stats.tokens.words.unigrams + doc.stats.words.unigrams[item];
            // self.debug('word ' + item + doc.stats.words.unigrams[item]);
            if (!stats.words.unigrams[item]) {
              stats.types.words.unigrams = stats.types.words.unigrams + 1;
              stats.words.unigrams[item] = doc.stats.words.unigrams[item];
              continue;
            }
            stats.words.unigrams[item] = stats.words.unigrams[item] + doc.stats.words.unigrams[item];
          }
        }
      });

      if (stats.types.characters.unigrams) {
        self.debug('dividing ' + stats.tokens.characters.unigrams + ' / ' + stats.types.characters.unigrams);
        stats.ttr.characters.unigrams = stats.tokens.characters.unigrams / stats.types.characters.unigrams;
        self.debug('= ' + stats.ttr.characters.unigrams);
      }
      if (stats.types.words.unigrams) {
        self.debug('dividing ' + stats.tokens.words.unigrams + ' / ' + stats.types.words.unigrams);
        stats.ttr.words.unigrams = stats.tokens.words.unigrams / stats.types.words.unigrams;
        self.debug('= ' + stats.ttr.words.unigrams);
      }

      self.debug('done with stats', stats);
      return stats;
    }
  }
});

exports.ComputationalLinguisticsCorpus = ComputationalLinguisticsCorpus;
