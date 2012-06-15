define( [
    "use!backbone",
    "datum/Datum"
], function(Backbone,Datum) {
    var DatumState = Backbone.Model.extend(
    /** @lends DatumState.prototype */
    {
       /**
        * @class The datum state lets the fieldlinguists assign their own 
        *       state categories to data (ie check with informant, check 
        *       with x, checked, checked and wrong, hidden, deleted, whatever 
        *       state they decide.
        *
        * @description The initialize function The datum state creates a 
        *       new state object with the state set to the default (for 
        *       example, checked)
        * 
        * @extends Backbone.Model
        * @constructs
        */
        initialize: function() {
        },
    	defaults: {
//    	      states: ["Checked","To be checked","Deleted"],
    	     
    	      states: [{
    	          id: 0,
    	          label: 'Checked'
    	          
    	      }, {
    	          id: 1,
    	          label: 'To be checked',
    	          selected: 'selected' 
    	      }, {
              id: 2,
              label: 'Deleted'
    	      }, {
    	        id: 3,
    	        label: 'Add...'
    	      }], 
    	      
    	      active: 1,
    	      defaultState: 1
    	   },
    });
    
    return DatumState;
});