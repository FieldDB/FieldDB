define([ 
    "libs/backbone" 
], function(
    Backbone
) {
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
    initialize : function() {
    },
    
    defaults : {
      URL : "",
      FileName : "",
      type: "audio" //or video
    },
    
    model : {
      // There are no nested models
    },
    
    parse : function(response) {
      if (response.ok === undefined) {
        for (var key in this.model) {
          var embeddedClass = this.model[key];
          var embeddedData = response[key];
          response[key] = new embeddedClass(embeddedData, {parse:true});
        }
      }
      
      return response;
    },
  });

  return AudioVideo;
});