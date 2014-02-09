define(	[
    "backbone"
], function(
    Backbone
) {	
	var Image = Backbone.Model.extend(		
	/** @lends Image.prototype */ 	
	{
	  /**
	   * @class Image allows a user to use IPA symbols, characters other than Roman alphabets, etc.. 
	   * 		Users can add new symbols. Added symbols are saved and stored, and will show up next time the user 
	   * 		opens Image box. 
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
  	  URL : "", 
  	  filename : "",
  	  caption : ""
  	},
  	// Internal models: used by the parse function
    internalModels : {
      // There are no nested models
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
    
	}); 

	return Image;
	
});
