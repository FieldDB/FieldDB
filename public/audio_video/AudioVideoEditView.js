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
//      $(this.el).bind("dragover", _.bind(this.dragOverAudio, this));
//      $(this.el).bind("dragenter", _.bind(this.dragEnterAudio, this));
//      $(this.el).bind("dragleave", _.bind(this.dragLeave, this));
//      $(this.el).bind("drop", _.bind(this.dropAudio, this));
//      this._draghoverClassAdded = false;
    },
    
    events : {
      "dragenter .drop-zone" : function(e){
        this.dragEnterAudio(e);
      },
      "dragover .drop-zone" : function(e){
        this.dragOverAudio(e);
      },
      "dragleave .drop-zone" : function(e){
        this.dragLeave(e);
      },
      "drop .drop-zone": function(e){
        this.model.set("filename", e.dataTransfer.files[0].name);
        this.dropAudio(e);
      }
    },
    
    model : AudioVideo,

    classname : "audio_video",

    template : Handlebars.templates.audio_video_edit_embedded,

    render : function() {
      //http://www.terrillthompson.com/tests/html5-audio.html
      //users must download lame to make mp3 because html5 audio cant play wav? http://lame1.buanzo.com.ar/Lame_Library_v3.98.2_for_Audacity_on_OSX.dmg
      var dropzone = document.createElement("audio");
      if(this.model.get("filename")){
        var sourceaudio = document.createElement("source");
        sourceaudio.setAttribute("src",  "filesystem:" + window.location.origin +"/temporary/"+this.model.get("filename"));
        sourceaudio.setAttribute("type", "audio/"+this.model.get("filename").split('.').pop() );
        dropzone.appendChild(sourceaudio);
        dropzone.setAttribute("preload","");
      }
      dropzone.setAttribute("controls", "");
//      dropzone.setAttribute("tabindex","0"); //needed to play it using tab, this puts it first...
      dropzone.setAttribute("id", "playerdatums");
//      dropzone.setAttribute("loop", "true");
//      dropzone.classList.add("drop-zone");
//      dropzone.classList.add("pull-right");
      dropzone.classList.add("datum-audio-player");
      dropzone.addEventListener('drop', this.dropAudio, false);
      dropzone.addEventListener('dragover', this.dragOverAudio, false);
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
    
    dropAudio: function(e) {
      Utils.debug("Recieved a drop event ");
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }
      if (e.preventDefault) {
        e.preventDefault(); 
      }      
      this.classList.remove('halfopacity');
      //Use the terminal to put the file into the file system
      window.appView.term.addDroppedFiles(e.dataTransfer.files);
      window.appView.term.output('<div>File(s) added!</div>');
      var audio = $(this);
      audio.empty();
      //http://stackoverflow.com/questions/7953593/change-source-to-audio-html5-element
      var newSrc = $("<source>").attr("src", "filesystem:" + window.location.origin +"/temporary/"+e.dataTransfer.files[0].name).appendTo(audio);
      /****************/
      audio.pause();
      audio.load();//suspends and restores all audio element
      /****************/
      return false;
    }
  });

  return AudioVideoEditView;
});