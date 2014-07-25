(function(exports) {

  var FieldDBDatabase = require('./Database').Database;

  var PsycholinguisticsDatabase = function PsycholinguisticsDatabase(options) {
    console.log("In PsycholinguisticsDatabase ", options);
    FieldDBDatabase.apply(this, arguments);
  };
  var DEFAULT_COLLECTION_MAPREDUCE = '_design/psycholinguistics/_view/COLLECTION?descending=true';

  PsycholinguisticsDatabase.prototype = Object.create(FieldDBDatabase.prototype, /** @lends PsycholinguisticsDatabase.prototype */ {
    constructor: {
      value: PsycholinguisticsDatabase
    },

    DEFAULT_COLLECTION_MAPREDUCE: {
      value: DEFAULT_COLLECTION_MAPREDUCE
    }
  });

  console.log(PsycholinguisticsDatabase);
  exports.PsycholinguisticsDatabase = PsycholinguisticsDatabase;

})(typeof exports === 'undefined' ? this['PsycholinguisticsDatabase'] = {} : exports);
