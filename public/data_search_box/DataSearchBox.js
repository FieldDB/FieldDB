define("data_search_box/DataSearchBox", [
    "use!backbone",
    "datum/Datum"
  //"corpus/Corpus"
], function(Backbone,Datum) {
    var DataSearchBox = Backbone.Model.extend(
    /** @lends DataSearchBox.prototype */
    {
       /**
        * @class DataSearchBox is where users type in search keywords. 
        * 		 A search function looks up the entered keywords in  
        * 		 a corpus. Both intersective and union searches are 
        * 		 possible. 
        *   
        *
        * @description The initialize function probably creates the link 
        * 			   to a corpus, or checks if a link to a corpus is 
        * 			   established.  
        * 
        * @extends Backbone.Model
        * @constructs
        */
        initialize: function() {
        },
    	defaults: {
//    	   Default DataSearchBox box is just a box containing a null string as a keyword.   

    		searchKeywords : "passive"
    	   },
    	  
    	   
    	validate : function(attributes) {

           }
    });
    
    return DataSearchBox;
});