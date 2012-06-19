define([ 
  "use!backbone" 
  ], function(Backbone) {

  var AudioVisual = Backbone.Model.extend(

  /** @lends AudioVisual.prototype */

  {
    /**
     * @class AudioVisual allows a user to add audio and video files.
     * 
     * @description Initialize function
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     */
    defaults : {
      URL : "",
      FileName : ""
    },
    initialize : function() {

    },

    validate : function() {

    }

  });

  return AudioVisual;

});