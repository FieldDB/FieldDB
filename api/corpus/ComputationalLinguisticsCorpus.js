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
            // self.debug('character ' + item + doc.stats.characters.unigrams[item]);
            if (!stats.characters.unigrams[item]) {
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
            // self.debug('character ' + item + doc.stats.words.unigrams[item]);
            if (!stats.words.unigrams[item]) {
              stats.words.unigrams[item] = doc.stats.words.unigrams[item];
              continue;
            }
            stats.words.unigrams[item] = stats.words.unigrams[item] + doc.stats.words.unigrams[item];
          }
        }
      });

      return stats;
    }
  }
});

exports.ComputationalLinguisticsCorpus = ComputationalLinguisticsCorpus;
