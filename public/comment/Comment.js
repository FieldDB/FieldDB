var Comment = Backbone.Model.extend(
/** @lends Comment.prototype */
{
   /**
    * @class Describe the Comment model here.
    *
    * @property {String} text Describe text here.
    * @property {Number} userid Describe userid here.
    * @property {Date} timestamp Describe timestamp here.
    *
    * @description Describe the initialize function here.
    *
    * @extends Backbone.Model
    * @constructs
    */
   initialize: function() {
      this.bind('error', function(model, error) {
         // TODO Handle validation errors
      });
      this.timestamp = Date.now();
      // TODO Set up any other bindings (i.e. what to do when certain Events 
      //      happen). Example:
      // this.bind("change:someAttribute", function() {
      //    console.log("We just changed someAttribute");
      // });

   },

   // This is an list of attributes and their default values
   defaults: {
      // TODO set up attributes and their defaults. Example:
      // someAttribute: 5,
      // someAttribute2: 'Hello world',
      // someAttribute3: []
      text: "", 
      userid: ""
   },

   /**
    * Describe the validation here.
    *
    * @param {Object} attributes The set of attributes to validate.
    *
    * @returns {String} The validation error, if there is one. Otherwise, doesn't
    * return anything.
    */
   validate: function(attributes) {
      // This is used to validate any changes to the model. It is called whenever
      // comment.set('someAttribute', __) is called, but before the changes are
      // actually made to someAttribute.

      // TODO Validation on the attributes. Returning a String counts as an error. Example:
      // if (attributes.someAttribute <= 0) {
      //    return "Must use positive numbers";
      // }
   }

   // TODO Add any other methods that will manipulate the Comment attributes. Example:
   //   ,
   //   /**
   //    * Describe the addOne function here.
   //    * 
   //    * @returns {Number} Describe the return value here.
   //    */
   //   addOne: function() {
   //      return this.someAttribute++;
   //   }
});

