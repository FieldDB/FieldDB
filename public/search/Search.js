define("serarch/Search", 
		["use!Backbone"], 
		function(Backbone){
	
	var Search = Backbone.Model.extend(
			
	/** @lends Search.prototype  */ 
			
		{
			/** 
			 * @class Search progressively searches a corpus and updates a search view as a user type in the search box.
			 *        It highlights search keywords in the list view.  
			 * 
			 * @property {Datum} 
			 * @property {DataList} 
			 * @property {DatumTag} 
			 * @property {Corpus} 
			 * 
			 * 
			 * 
			 * @description 
			 * 
			 * @extends Backbone.Model 
			 * 
			 * @constructs 
			 * 
			 */

			initialize : function() {
				
			}, 
		
		
		});
	
	return Search; 
}); 

