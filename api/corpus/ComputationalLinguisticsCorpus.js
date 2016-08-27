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

      return datalist.docs.map(function(doc) {
        if (typeof doc.extractStats === "function") {
          return doc.extractStats.apply(doc);
        }
        return doc;
      });
    }
  }
});

exports.ComputationalLinguisticsCorpus = ComputationalLinguisticsCorpus;
