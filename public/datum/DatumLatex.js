define("datum_latex/DatumLatex", [
    "use!backbone",
    "datum/Datum"
  //"corpus/Corpus"
], function(Backbone,Datum) {
    var DatumLatex = Datum.Model.extend(
    /** @lends DataListTitle.prototype */
    {
       /**
        * @class DatumLatex shows up as an item in the Data List as a result of  
        *        search. As a default a DatumLatex item has three fields (utterance, 
        *        gloss, translation) showing up in the Data List. Morphemes are 
        *        aligned with corresponding gloss as in Latex, but this is not a 
        *        true Latex format (just looking like Latex). 
        *          
        *   
        *
        * @description The initialize function probably creates the link to
        * 			   a data list, or checks if a link to a data list is 
        * 			   established.  
        * 
        * @extends Backbone.Model
        * @constructs
        */
        initialize: function() {
        },
    	defaults: {
//    	   DataListTitle consists of three attributes: data list title, date created, description. THe default value for 
//			for each is an empty string 
    		
    		dataListTitle : "LING380 Handout 6"
    		dateCreated : "May 30, 2012"
    		description : "antipassive examples"	
    			
    	   },
    	  
    	   
    	validate : function(attributes) {

           }
    });
    
    return DataListTitle;
});