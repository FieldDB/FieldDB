var DataList = require("./DataList").DataList;
var Stimulus = require("./../datum/Stimulus").Stimulus;
var DocumentCollection = require("./../datum/DocumentCollection").DocumentCollection;
var Comments = require("./../comment/Comments").Comments;
var ContextualizableObject = require("./../locales/ContextualizableObject").ContextualizableObject;

/**
 * @class The SubExperimentDataList allows the user to add additional information
 *  which can be used for experiments using the datum in the datalist.
 *
 * @name  SubExperimentDataList
 * @extends DataList
 * @constructs
 */
var SubExperimentDataList = function SubExperimentDataList(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "SubExperimentDataList";
  }
  this.debug("Constructing SubExperimentDataList ", options);
  DataList.apply(this, arguments);
};

SubExperimentDataList.prototype = Object.create(DataList.prototype, /** @lends SubExperimentDataList.prototype */ {
  constructor: {
    value: SubExperimentDataList
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      comments: Comments,
      docs: DocumentCollection,
      title: ContextualizableObject,
      description: ContextualizableObject,
      instructions: ContextualizableObject,
      item: Stimulus
    }
  },

  subexperiments: {
    get: function() {
      if (this.docs && this.docs.length > 0) {
        return this.docs;
      }
      return this.docIds;
    },
    set: function(value) {
      if ((value && value[0] && typeof value[0] === "object") || value.constructor === DocumentCollection) {
        this.docs = value;
      } else {
        this.docIds = value;
        this._subexperiments = value;
      }
    }
  },

  trials: {
    get: function() {
      if (this.docs && this.docs.length > 0) {
        return this.docs;
      }
      return this.docIds;
    },
    set: function(value) {
      if ((value && value[0] && typeof value[0] === "object") || value.constructor === DocumentCollection) {
        this.docs = value;
      } else {
        this.docIds = value;
        this._trials = value;
      }
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);
      // Force docIds to be set to current docs
      // this._subexperiments = this.docIds;
      // this._trials = this.docIds;
      var json = DataList.prototype.toJSON.apply(this, arguments);
      this.debug(json);
      if (this.docs && this.docs.toJSON) {
        this.todo("only save trials/subexperiments if there are responses in the trials, or if the experiment started or somethign. ");
        json.results = this.docs.toJSON();
      }
      return json;
    }
  }

});
exports.SubExperimentDataList = SubExperimentDataList;
