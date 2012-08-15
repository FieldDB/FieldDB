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
      
    },
    
    model : AudioVideo,

    classname : "audio_video",

    template : Handlebars.templates.audio_video_edit_embedded,

    render : function() {
      //http://www.terrillthompson.com/tests/html5-audio.html
      //users must download lame to make mp3 because html5 audio cant play wav? http://lame1.buanzo.com.ar/Lame_Library_v3.98.2_for_Audacity_on_OSX.dmg
      var dropzone = document.createElement("audio");
      var audiofilespan ="";
      
      if(this.model.get("filename")){
        audiofilespan ="<small class='datum-audio-filename pull-right'>"+this.model.get("filename")+"</span>";
        var sourceaudio = document.createElement("source");
        sourceaudio.setAttribute("src",  this.model.get("URL"));
        sourceaudio.setAttribute("type", "audio/"+this.model.get("filename").split('.').pop() );
        dropzone.appendChild(sourceaudio);
        dropzone.setAttribute("preload","");
        dropzone.pause();
        dropzone.load();//suspends and restores all audio element
//        dropzone.play(); //Dont play automatically
      }else{
        //TODO not working yet.
//        audiofilespan = '<input type="file" id="files1" name="files1[]" multiple="">';
//        var self = this;
//        $(audiofilespan).change = function(e){
//          console.log("changing audio file");
//          self.handleFileSelect(e, self);
//          return false;
//        }
      }
      dropzone.setAttribute("controls", "");
//      dropzone.setAttribute("tabindex","0"); //needed to play it using tab, this puts it first...
      dropzone.setAttribute("id", "playerdatums");
//      dropzone.setAttribute("loop", "true");
//      dropzone.classList.add("drop-zone");
//      dropzone.classList.add("pull-right");
      dropzone.classList.add("datum-audio-player");
      var self = this;
      dropzone.addEventListener('drop', function(e){
        if (e.stopPropagation) {
          e.stopPropagation(); // stops the browser from redirecting.
        }
        if (e.preventDefault) {
          e.preventDefault(); 
        }  
        var audio = this;
        self.dropAudio(e, audio, self);
        return false;
      }, false);
      dropzone.addEventListener('dragover', this.dragOverAudio, false);
      $(this.el).html(dropzone);
      
      $(this.el).append(audiofilespan);
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
    
    dropAudio: function(e, audio, self) {
      Utils.debug("Recieved a drop event ");
//      if (e.stopPropagation) {
//        e.stopPropagation(); // stops the browser from redirecting.
//      }
//      if (e.preventDefault) {
//        e.preventDefault(); 
//      }      
      audio.classList.remove('halfopacity');
      //Use the terminal to put the file into the file system
      window.appView.term.addDroppedFiles(e.dataTransfer.files);
      window.appView.term.output('<div>File(s) added!</div>');
      var audiojs = $(audio);
      audiojs.empty();
      //http://stackoverflow.com/questions/7953593/change-source-to-audio-html5-element
      var filename = e.dataTransfer.files[0].name;
      var url =  "filesystem:" + window.location.origin +"/temporary/"+filename;
      if(filename.indexOf("http") > 0){
        filename = url;
      }
//      var newSrc = $("<source>").attr("src", url).appendTo(audiojs);
      self.model.set("filename", filename);
      self.model.set("URL",url);
      self.render(); //this will do the audio source thing for us.
      /****************/
      audio.pause();
//      audio.load();//suspends and restores all audio element
//      audio.play();
      /****************/
      
//      return false;
    },
    handleFileSelect : function(evt, self) {
      var files = evt.target.files; // FileList object

      var filename = files[0].name;
      var url =  "filesystem:" + window.location.origin +"/temporary/"+filename;
      if(filename.indexOf("http") > 0){
        filename = url;
      }
      self.model.set("filename", filename);
      self.model.set("URL",url);
      self.render();
    }
  });

  return AudioVideoEditView;
});