define([ "backbone", 
         "insert_unicode/InsertUnicode"
      ], function(Backbone, InsertUnicode) {
  var InsertUnicodes = Backbone.Collection.extend(

      /** @lends InsertUnicodes.prototype  */

      {
        /**
         * @class InsertUnicodes is a set of unicode symbols. 
         * 
         * @extends InsertUnicode.Collection
         * @constructs
         * 
         */  
        initialize: function() {
          this.bind('error', function(model, error) {
            // TODO Handle validation errors
          });

          model: InsertUnicode; 
        }
      });


  return InsertUnicodes;
});
