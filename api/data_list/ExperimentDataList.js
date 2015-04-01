var SubExperimentDataList = require("./SubExperimentDataList").SubExperimentDataList;
var DocumentCollection = require("./../datum/DocumentCollection").DocumentCollection;
var Comments = require("./../comment/Comments").Comments;
var ContextualizableObject = require("./../locales/ContextualizableObject").ContextualizableObject;

/**
 * @class The ExperimentDataList allows the user to add additional information
 *  which can be used for experiments using the datum in the datalist.
 *
 * @name  ExperimentDataList
 * @extends SubExperimentDataList
 * @constructs
 */
var ExperimentDataList = function ExperimentDataList(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "ExperimentDataList";
  }
  this.debug("Constructing ExperimentDataList ", options);
  SubExperimentDataList.apply(this, arguments);
};

ExperimentDataList.prototype = Object.create(SubExperimentDataList.prototype, /** @lends ExperimentDataList.prototype */ {
  constructor: {
    value: ExperimentDataList
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      comments: Comments,
      docs: DocumentCollection,
      title: ContextualizableObject,
      description: ContextualizableObject,
      instructions: ContextualizableObject,
      item: SubExperimentDataList
    }
  }

});
exports.ExperimentDataList = ExperimentDataList;
