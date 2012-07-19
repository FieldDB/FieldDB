define([ 
    "backbone",
     "handlebars", 
     "audio_video/AudioVideo"
], function(
    Backbone, 
    Handlebars,
    AudioVideo
) {
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
      "dragenter" : function(e){
        this.dragEnterAudio(e);
      },
      "dragover" : function(e){
        this.dragOverAudio(e);
      },
      "dragleave" : function(e){
        this.dragLeave(e);
      },
      "drop": function(e){
        this.dropAudio(e, this);
        this.set("filename",e.dataTransfer.files[0].name);
      }
    },
    
    model : AudioVideo,

    classname : "audio_video",

    template : Handlebars.templates.audio_video_edit_embedded,

    render : function() {
      var dropzone = document.createElement("input");
      dropzone.classList.add("drop-zone");
      dropzone.classList.add("pull-right");
      dropzone.addEventListener('drop', this.dropAudio, false);
      dropzone.addEventListener('dragover', this.dragOverAudio, false);
      dropzone.setAttribute("placeholder","Drop audio or video files here!");
      $(this.el).html(dropzone);
      return this;
    },
    
    dragEnterAudio: function(e) {
      e.stopPropagation();
      e.preventDefault();
      this.classList.add('halfopacity');
    },
    
    dragOverAudio : function(e) {
//      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move'; // Explicitly show this is a copy.
      return false;
    },
    
    dragLeave: function(e) {
      this.classList.remove('halfopacity');
    },
    
    dropAudio: function(e, self) {
      Utils.debug("Recieved a drop event ");
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }
      if (e.preventDefault) {
        e.preventDefault(); 
      }      
      this.classList.remove('halfopacity');
      window.appView.term.addDroppedFiles(e.dataTransfer.files);
      window.appView.term.output('<div>File(s) added!</div>');
      this.value = e.dataTransfer.files[0].name;
//      self.model.set("filename",e.dataTransfer.files[0].name);
      alert("Audio file was copied! (cant play yet)");
      return false;
    }
  });

  return AudioVideoEditView;
});