define([ "use!backbone",
         "use!handlebars", 
         "text!audio_video/audio_video_edit_embedded.handlebars",
         "audio_video/AudioVideo"
  ], function(Backbone, 
              Handlebars,
              audio_videoTemplate,
              AudioVideo) {
  var AudioVideoEditView = Backbone.View.extend(
  /** @lends AudioVideoEditView.prototype */
  {
    /**
     * @class This is the view of the Audio Video Model.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      
      
    },
    events : {
      "dragenter" : "dragEnterAudio",
      "dragover" : "dragOverAudio",
      "dragleave" : "dragLeave",
      "drop": "dropAudio"
    },
    model : AudioVideo,

    classname : "audio_video",

    template : Handlebars.compile(audio_videoTemplate),

    render : function() {
      this.setElement($(".audio_video"));
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    dragEnterAudio: function(e) {
      e.stopPropagation();
      e.preventDefault();
//      this.classList.add('dropping');
    },
    dragOverAudio : function(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    },
    dragLeave: function(e) {
//      this.classList.remove('dropping');
    },
    dropAudio: function(e) {
      e.stopPropagation();
      e.preventDefault();
//      this.classList.remove('dropping');
      window.appView.term.addDroppedFiles(e.dataTransfer.files);
      window.appView.term.output('<div>File(s) added!</div>');
    }
  
  });

  return AudioVideoEditView;
});