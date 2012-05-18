define("hotkey/HotKey", 
		["use!backbone"] ,
    function(Backbone) {
      var HotKey = Backbone.Model
      .extend(

          /** @lends HotKey.prototype */
          {
            /**
             * @class A HotKey is a keyboard shortcut that uses one key (or a combination thereof) 
             * which allows users to execute a command without using a mouse, a menu, etc.
             * 
             *         
             * 
             * 
             * @description The initialize function probably checks to see if
             *              any hotkeys exist and creates a new one if there are none.
             * 
             * @extends Backbone.Model
             * @constructs
             */

            // This is the constructor. It is called whenever you make a new
            // HotKey.
            initialize : function() {
              // this.bind('error', function(model, error) {
              // // TODO Handle validation errors
              // });

            },

            // This is a list of attributes and their default values
            defaults : {
            	
              firstKey: "",
              secondKey: "",
              functiontocall: function(){},
              description: ""

            },

            /**
             * Describe the validation here.
             * 
             * @param {Object}
             *            attributes The set of attributes to validate.
             * 
             * @returns {String} The validation error if there is one. Otherwise
             *          doesn't return anything.
             */

            validate : function(attributes) {

            }

          });

      return HotKey;
    });