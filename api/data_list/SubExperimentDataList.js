var DataList = require('./DataList').DataList;

/**
 * @class The SubExperimentDataList allows the user to add additional information
 *  which can be used for experiments using the datum in the datalist.
 *
 * @name  SubExperimentDataList
 * @extends DataList
 * @constructs
 */
var SubExperimentDataList = function SubExperimentDataList(options) {
  this.debug("Constructing SubExperimentDataList ", options);
  DataList.apply(this, arguments);
};

SubExperimentDataList.prototype = Object.create(DataList.prototype, /** @lends SubExperimentDataList.prototype */ {
  constructor: {
    value: SubExperimentDataList
  }

});
exports.SubExperimentDataList = SubExperimentDataList;
