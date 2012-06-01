define("data_list_title/DataListTitle", [
    "use!backbone"
], function(Backbone) {

    var DataListTitle = Backbone.Model.extend(
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
        this.bind('error', function(model, error) {
           // TODO Handle validation errors
        });

        // TODO Set up any other bindings (i.e. what to do when certain Events 
        //      happen). Example:
        // this.bind("change:someAttribute", function() {
        //    console.log("We just changed someAttribute");
        // });
       
     },
     
     
     
 	defaults: {
// 	   DataListTitle consists of three attributes: data list title, date created, description. THe default value for 
//			for each is an empty string 
 		
 		dataListTitle : "LING380 Handout 6",
 		dateCreated : "May 30, 2012",
 		description : "antipassive examples"	
 			
 	   },
    

     /**
      * <TODO Describe the validation here.>
      *
      * @param {Object} attributes The set of attributes to validate.
      *
      * @returns {String} The validation error, if there is one. Otherwise, doesn't
      * return anything.
      */
     validate: function(attributes) {
        //I'm not sure what this function is supposed to do for this particular model, honestly, the use should be able to put in wahtever they want in the fields.    
        // TODO Validation on the attributes. Returning a String counts as an error.
        //      Example:
        // if (attributes.someAttribute <= 0) {
        //    return "Must use positive numbers";
        // }
     },
     
     
      });

    return DataListTitle;

});








           














