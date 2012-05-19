define("lexicon/Lexicon", 
		["use!backbone"], 
		function(Backbone) {
	
	var Lexicon = Backbone.Model.extend(
			
	/** @lends Lexicon.prototype */ 
			
	{
		/** 
		 * @class Lexicon searches a corpus for morphemes and their associated tags and feeds to 
		 * 		  a lexicon server for statistical learning (this is NLP part).   
		 *		
		 * @description 
		 * 
		 * @extends Backbone.Model 
		 * 
		 * @constructus
		 * 
		 */

	initialize : function(){
		
		
	},
	
	}); 
	
	return Lexicon; 
	
}); 
