define(	[
    "backbone"
], function(
    Backbone
) {	
	var InsertUnicode = Backbone.Model.extend(		
	/** @lends InsertUnicode.prototype */ 	
	{
	  /**
	   * @class InsertUnicode allows a user to use IPA symbols, characters other than Roman alphabets, etc.. 
	   * 		Users can add new symbols. Added symbols are saved and stored, and will show up next time the user 
	   * 		opens InsertUnicode box. 
	   * 
	   * @description Initialize function 
	   * 
	   * @extends Backbone.Model
	   * 
	   * @constructs
	   */ 
  	initialize: function(){
  	}, 
  	
  	defaults : {
  	  symbol : "ɐ" 
  	},
  	// Internal models: used by the parse function
    model : {
      // There are no nested models
    }
	}); 

	return InsertUnicode;
	
});