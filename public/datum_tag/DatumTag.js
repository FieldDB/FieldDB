define("DatumTag",[
    "use!backbone"
  ], function(Backbone) {

    var DatumTag = Backbone.Model.extend(
      /** @lends DatumTag.prototype */
      {
       /**
        * @class The DatumTag allows the user to label data with grammatical tags i.e. passive, causative.  This is useful for searches.  
        *
        * 
        * @description The initialize function brings up a field in which the user can enter tags.
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
        //The field begins as empty and users can enter as many as they want.
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

    return DatumTag;
});








           














