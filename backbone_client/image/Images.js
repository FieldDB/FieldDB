define([ "backbone", 
         "image/Image"
      ], function(Backbone, Image) {
  var Images = Backbone.Collection.extend(

      /** @lends Images.prototype  */

      {
        /**
         * @class Images is a set of unicode symbols. 
         * 
         * @extends Image.Collection
         * @constructs
         * 
         */  
        initialize: function() {
          this.bind('error', function(model, error) {
            // TODO Handle validation errors
          });
          
        },
        internalModels: Image,
        model: Image,
        
      });


  return Images;
});
