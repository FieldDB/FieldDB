var FieldDBDatabase = require("./Database").Database;

var PsycholinguisticsDatabase = function PsycholinguisticsDatabase(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "PsycholinguisticsDatabase";
  }
  this.debug("In PsycholinguisticsDatabase ", options);
  FieldDBDatabase.apply(this, arguments);
};
var DEFAULT_COLLECTION_MAPREDUCE = "_design/psycholinguistics/_view/COLLECTION?descending=true";

PsycholinguisticsDatabase.prototype = Object.create(FieldDBDatabase.prototype, /** @lends PsycholinguisticsDatabase.prototype */ {
  constructor: {
    value: PsycholinguisticsDatabase
  },

  DEFAULT_COLLECTION_MAPREDUCE: {
    value: DEFAULT_COLLECTION_MAPREDUCE
  }
});

exports.PsycholinguisticsDatabase = PsycholinguisticsDatabase;
