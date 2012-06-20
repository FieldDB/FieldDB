define([ 
  "use!backbone" 
  ], function(Backbone) {

  var AudioVideo = Backbone.Model.extend(

  /** @lends AudioVideo.prototype */

  {
    /**
     * @class AudioVideo models allows a user to add audio and video files.
     * 
     * @description Initialize function
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     */
    defaults : {
      URL : "",
      FileName : "",
      type: "audio" //or video
    },
    initialize : function() {

    },

    validate : function() {

    }

  });

  return AudioVideo;

});