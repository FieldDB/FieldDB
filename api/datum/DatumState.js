var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var UserMask = require("./../user/UserMask").UserMask;

/**
 * @class The datum state lets the fieldlinguists assign their own state
 *        categories to data (ie check with consultant, check with x,
 *        checked, checked and wrong, hidden, deleted), whatever state they
 *        decide. They an make each state have a color so that the team can
 *        see quickly if there is something that needs to be done with that
 *        data. We also added an optional field, Consultant that they can use
 *        to say who they want to check with in case they have mulitple
 *        consultants and the consultants have different grammaticality
 *        judgements. When users change the state of the datum, we will add
 *        a note in the datum"s comments field so that the history of its
 *        state is kept in an annotated format.
 *
 * @name  DatumState
 *
 * @extends FieldDBObject
 * @constructs
 */
var DatumState = function DatumState(options) {
  this.debug("Constructing DatumState ", options);
  FieldDBObject.apply(this, arguments);
  this._fieldDBtype = "DatumState";
};

DatumState.prototype = Object.create(FieldDBObject.prototype, /** @lends DatumState.prototype */ {
  constructor: {
    value: DatumState
  },

  defaults: {
    value: {
      state: "Checked",
      color: "",
      consultant: UserMask, //TODO comment out htis line when we confirm that state is working
      showInSearchResults: "checked",
      selected: ""
    }
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      consultant: UserMask
    }
  },

  validationStatus: {
    get: function() {
      if (!this._validationStatus && this.state) {
        this.warn("state is deprecated, use validationStatus instead.");
        this._validationStatus = this.state;
      }
      return this._validationStatus || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._validationStatus) {
        return;
      }
      if (!value) {
        delete this._validationStatus;
        return;
      }
      this._validationStatus = value.trim();
    }
  }

});
exports.DatumState = DatumState;
