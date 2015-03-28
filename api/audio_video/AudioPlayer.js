/* globals document, Media */

var HTML5Audio = require("./HTML5Audio").HTML5Audio,
  CordovaAudio = require("./HTML5Audio").HTML5Audio;

/**
 * @class AudioPlayer is a minimal customization of the HTML5 media controller
 *
 * @name AudioPlayer
 *
 * @extends Object
 * @constructs
 */
var AudioPlayer = function AudioPlayer(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "AudioPlayer";
  }
  if (this.options) {
    console.warn("AudioPlayer was created with options but it doesnt accept options", options);
  }
  // console.log(HTML5Audio);
  // console.log(CordovaAudio.play);
  this.mediaController = new HTML5Audio();

  Object.apply(this, arguments);
};

AudioPlayer.prototype = Object.create(Object.prototype, /** @lends AudioPlayer.prototype */ {
  constructor: {
    value: AudioPlayer
  },

  isPlaying: {
    configurable: true,
    get: function() {
      return this.mediaController.isPlaying;
    }
  },

  isPaused: {
    configurable: true,
    get: function() {
      return this.mediaController.isPaused;
    }
  },

  audioPlayStartTime: {
    configurable: true,
    get: function() {
      if (this.mediaController.audioPlayStarted) {
        return this.mediaController.audioPlayStarted;
      } else {
        return 0;
      }
    }
  },

  isCordova: {
    configurable: true,
    get: function() {
      // return false;
      try {
        if (!Media) {
          console.log("We are most likely in Cordova, using Cordova instead of HTML5 audio");
        }
        return true;
      } catch (e) {
        console.log("We are most likely not in Cordova, using HTML5 audio");
        return false;
      }
    }
  },

  getDuration: {
    configurable: true,
    value: function(src) {
      if (src && this.src.indexOf(src) > -1 && this.mediaController.src.indexOf(src) > -1) {
        return this.mediaController.duration || 0;
      } else {
        console.log("Duration wasn't clear, so returning 0");
        return 0;
      }
    }
  },

  src: {
    configurable: true,
    get: function() {
      return this._src;
    },
    set: function(value) {
      if (value && value.trim() && value.trim() === this._src) {
        return;
      }
      console.log("Changed audio source: " + value);
      if (this.isCordova && this.mediaController.library !== "Cordova") {
        this._src = value;
        this.mediaController = CordovaAudio;
      } else {
        try {
          if (!value.match(/^[^:]+:\/\//)) {
            this._src = document.location.href.replace(document.location.pathname, "/" + value);
          } else {
            this._src = value;
          }
          if (!this.mediaController._audioElement) {
            //Try to use the full path to the audio file if its a relative path
            if (document.getElementById(this._src)) {
              this.mediaController._audioElement = document.getElementById(this._src);
            } else {
              var audio = document.createElement("audio");
              audio.setAttribute("id", this._src);
              //todo set hidden?
              document.body.appendChild(audio);
              this.mediaController._audioElement = audio;
            }
          }
        } catch (e) {
          this.warn("There is no DOM, cant set audio src");
          this.debug(e);
        }
      }

      this.mediaController.src = this._src;
      console.log("Set the src in core/audio-player " + this._src);
    }
  },

  play: {
    configurable: true,
    value: function(optionalSource, optionalDelay) {
      if (optionalSource) {
        this.src = optionalSource;
      }
      if (this.mediaController) {
        console.log("this.mediaController.play " + this._src);
        this.mediaController.play(this._src, optionalDelay);
      } else {
        console.log("couldnt play " + this._src);
      }
    }
  },

  pause: {
    configurable: true,

    value: function() {
      if (this.mediaController) {
        this.mediaController.pause();
      }
    }
  },

  togglePause: {
    configurable: true,
    value: function() {
      console.log("togglePause");
      if (this.mediaController) {
        if (this.mediaController.isPaused) {
          console.log("   playing");
          this.mediaController.play();
        } else {
          console.log("   paused");
          this.mediaController.pause();
        }
      }
    }
  },

  stop: {
    configurable: true,
    value: function() {
      if (this.mediaController) {
        this.mediaController.stop();
      }
    }
  },

  addEvent: {
    configurable: true,
    value: function(message, startTime, endTime) {
      if (this.mediaController) {
        this.mediaController.addAudioEventAtTimePeriod(message, startTime, endTime);
      }
    }
  }
});

exports.AudioPlayer = AudioPlayer;
