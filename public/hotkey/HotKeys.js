define("HotKeys",
    [ "use!backbone"

      ], 
      function(Backbone) {
  var HotKeys = HotKey.Collection.extend(

      /** @lends HotKeys.prototype  */

      {
        /**
         * @class HotKeys is a set of HotKey. A user will be able to have multiple shortcuts. 
         * There will be defaults, but users will also be able to select their own HotKeys.
         * 
         * IPA This will allow users to easily switch to type in IPA
         * fullscreen This will expand the view
         * nextDatum This will allow users to skip to the next datum entry field
         * previousDatum This will allow users to go back to the previous datum entry field 
         * sync This will allow users to easily sync to the server 
         * 
         * @extends HotKey.Collection
         * @constructs
         * 
         */  
        initialize: function() {
          this.bind('error', function(model, error) {
            // TODO Handle validation errors
          });

          model: HotKey; 
        }
      });


  return HotKeys;
});
