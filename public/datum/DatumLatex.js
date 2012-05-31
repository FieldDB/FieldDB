define("datum_latex/DatumLatex", [
    "use!backbone",
    "datum/Datum"
  //"corpus/Corpus"
  //"search/Search"  
], function(Backbone,Datum) {
    var DatumLatex = Datum.Model.extend(
    /** @lends Data.prototype */
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
        * @description The initialize function probably creates a link to Search. 
        * 
        * @extends Backbone.Model
        * @constructs
        */
        initialize: function(attributes) {
            DatumLatex.__super__.initialize.call(this, attributes);
        },
        
    	defaults: {
    			
    	   },
    	  
    	   
    	validate : function(attributes) {

           }
    });
    
    return DatumLatex;
});