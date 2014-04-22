define([ 
    "backbone",
    "handlebars", 
    "audio_video/AudioVideo"
], function(
    Backbone, 
    Handlebars,
    AudioVideo
) {
  var AudioVideoReadView = Backbone.View.extend(
  /** @lends AudioVideoReadView.prototype */
  {
    /**
     * @class This is the view of the Audio Video Model.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
    },
    
    model : AudioVideo,

    template : Handlebars.templates.audio_video_read_embedded,

    render : function() {
      if(this.model.get("URL")){
        var jsonToRender = this.model.toJSON();
        jsonToRender.audioType = "audio/"+this.model.get("filename").split('.').pop() ;

        //If this audio file was already loaded in the document, dont load it again.
        if(document.getElementById("audiovideo_"+jsonToRender.filename)){
          return this;
        }
        console.log("rendering Audio Video ", jsonToRender);
        $(this.el).html(this.template(jsonToRender));
      }else{
        $(this.el).html(""); //render no audio player
      }
      
      return this;
    }
  });

  return AudioVideoReadView;
});
