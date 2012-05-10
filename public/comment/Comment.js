// TODO Describe the Comment model.
//      What does it represent in real life?
//      What are its attributes?

var Comment = Backbone.Model.extend({
   // This is an list of attributes and their default values
   defaults: {
      // TODO set up attributes and their defaults. Example:
      // someAttribute: 5,
      // someAttribute2: 'Hello world',
      // someAttribute3: []
   },

   // This is the constructor. It is called whenever you make a new Comment.
   initialize: function() {
      this.bind('error', function(model, error) {
         // TODO Handle validation errors
      }

      // TODO Set up any other bindings (i.e. what to do when certain Events 
      //      happen). Example:
      // this.bind("change:someAttribute", function() {
      //    console.log("We just changed someAttribute");
      // });

   },

   // This is used to validate any changes to the model. It is called whenever
   // comment.set('someAttribute', __) is called, but before the changes are
   // actually made to someAttribute.
   validate: function(attributes) {
      // TODO Validation on the attributes. Returning a String counts as an error.
      //      Example:
      // if (attributes.someAttribute <= 0) {
      //    return "Must use positive numbers";
      // }
   }

   // TODO Add any other methods that will manipulate the Comment attributes.
   //      Example:
   // ,
   // addOne: function() {
   //    this.someAttribute++;
   // }
});

