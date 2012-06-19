define([ "use!backbone",
         "use!handlebars", 
         "text!audio_video/audio_video.handlebars",
         "audio_video/AudioVideo"
  ], function(Backbone, 
              Handlebars,
              audio_videoTemplate,
              AudioVideo) {
  var AudioVideoView = Backbone.View.extend(
  /** @lends AudioVideoView.prototype */
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

    template : Handlebars.compile(audio_videoTemplate),

    render : function() {
      this.setElement($(".audio_video"));
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  return AudioVideoView;
});