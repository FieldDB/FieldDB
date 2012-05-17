define([ "use!backbone", 
         ], 
         function(Backbone) {
  var Comment = Backbone.Model.extend(

      /** @lends Comment.prototype */
      {
        /**
         * @class Comments allow users to collaborate between each other and take note of important things, issues to be fixed, etc. These can appear on datum, sessions
         * corpora, and dataLists. Comments can also be edited and removed. 
         *
         * @property {String} text Describe text here.
         * @property {Number} userid Describe userid here.
         * @property {Date} timestamp Describe timestamp here.
         *
         * @description Initialize function has a timestamp and a userid and waits until text is entered.
         *
         * @extends Backbone.Model
         * @constructs
         */
        initialize: function() {
          this.bind('error', function(model, error) {
            // TODO Handle validation errors
          });
          this.set("timestamp", Date.now());
          this.set("userid" , window.userid);
          // TODO Set up any other bindings (i.e. what to do when certain Events 
          //      happen). Example:
          // this.bind("change:someAttribute", function() {
          //    console.log("We just changed someAttribute");
          // });

        },

        // This is an list of attributes and their default values
        defaults: {
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

        /**
         * The remove function removes a comment.
         */
        ,    remove: function() {

        }

        /**
         * The edit function allows users to edit a comment.
         * 
         * @param {String} newtext Takes new text and replaces old one.
         * 
         */
        ,    edit: function(newtext) {
          this.set("text", newtext); 
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

  return Comment;
});