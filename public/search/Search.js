define("search/Search", [
    "use!Backbone"
   ], 
		function(Backbone){
	
	var Search = Backbone.Model.extend(
			
	/** @lends Search.prototype  */ 
			
		{
			/** 
			 * @class Search progressively searches a corpus and updates a 
			 *        search/data list view as a user types keywords in the 
			 *        search box. BOth eintersective and union search is 
			 *        possible. It highlights search keywords in the list view.  
			 * 
			 * @property {String} searchKeywords 
			 * @property {Datum} 
			 * @property {DataList} 
			 * @property {DatumTag} 
			 * @property {Corpus} 
			 * 
			 * 
			 * 
			 * @description The initialize function probably creates a link to 
			 *              a corpus, or checks if a link is established. 
			 * 
			 * @extends Backbone.Model 
			 * 
			 * @constructs 
			 * 
			 */

			initialize : function() {		
			}, 
			
			defaults: {
//            Default searchKeywords is a null string		
				searchKeywords : "passive" 
			}, 
			
	    	validate : function(attributes) {

	           }
		
		});
	
	return Search; 
}); 

