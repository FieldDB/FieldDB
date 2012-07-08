define([ 
    "use!backbone",
    "use!handlebars", 
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

    classname : "audio_video",

    template : Handlebars.templates.audio_video_read_embedded,

    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    }
  });

  return AudioVideoReadView;
});