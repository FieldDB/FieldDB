define([ 
    "backbone", 
    "user/UserMask" 
], function(
    Backbone,
    UserMask
) {
  var DatumState = Backbone.Model.extend(
  /** @lends DatumState.prototype */
  {
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
     *        a note in the datum's comments field so that the history of its
     *        state is kept in an annotated format.
     * 
     * @description The initialize function The datum state creates a new state
     *              object with the state set to the default (for example,
     *              checked)
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
    },
    
    defaults : {
      state : "Checked",
      color : "success",
      consultant : UserMask,//TODO comment out htis line when we confirm that state is working
      showInSearchResults : true,
      selected : ""
    },
    
    // Internal models: used by the parse function
    model : {
      consultant : UserMask
    }
  });

  return DatumState;
});