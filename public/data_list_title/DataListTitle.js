define("data_list_title/DataListTitle", [
    "use!backbone",
    "datum/Datum"
  //"corpus/Corpus"
], function(Backbone,Datum) {
    var DataSearchBox = Backbone.Model.extend(
    /** @lends DataListTitle.prototype */
    {
       /**
        * @class DataListTitle is a title, a date and a short description attached 
        * 		 to a particular data list a user creates, for example, "LING380 
        *        Handout 6; antipassive examples". DataListTitle can be exported 
        *        together with the data list it is attached to. 
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