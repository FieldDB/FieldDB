/* globals window */

/**
 * @class HTML5Audio is a minimal customization of the HTML5 media controller
 *
 * @name  HTML5Audio
 *
 * @extends Object
 * @constructs
 */
var HTML5Audio = function HTML5Audio(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "HTML5Audio";
  }
  if (this.options) {
    console.log("HTML5Audio was created with options but it doesnt accept options", options);
  }

  Object.apply(this, arguments);
};

HTML5Audio.prototype = Object.create(Object.prototype, /** @lends HTML5Audio.prototype */ {
  constructor: {
    value: HTML5Audio
  },


  /**
   * @type {string}
   * @default null
   */
  src: {
    configurable: true,
    get: function() {
      return this._src;
    },
    set: function(value) {
      if (value && value.trim() && value.trim() === this._src) {
        return;
      }
      this._src = value;
      console.log("Changed audio source" + value);
      // this.endAudioEvents = [];
      // this.audioEvents = [];
    }
  },

  matchesSource: {
    value: function(value) {
      return this._src.indexOf(value) > -1;
    }
  },

  handleSrcChange: {
    value: function(oldValue, newValue) {
      console.log("Handle audio source change ", oldValue, newValue);
    }
  },

  duration: {
    configurable: true,
    get: function() {
      if (this._audioElement && this._audioElement.duration) {
        return this._audioElement.duration;
      } else {
        return 0;
      }
    }
  },

  play: {
    value: function(optionalSource, delay) {
      if (optionalSource) {
        this.src = optionalSource;
      }
      console.log("Requesting play of audio file " + optionalSource);

      if (this._audioElement) {
        var sourceElement;
        if (this._audioElement.children && this._audioElement.children[0] && this._audioElement.children[0].src) {
          sourceElement = this._audioElement.children[0];
        } else {
          sourceElement = this._audioElement;
        }
        if (sourceElement.src === this.src && this.isPaused) {
          this._audioElement.play();
          this.isPaused = false;
          this.isPlaying = true;
          return;
        }
        if (!sourceElement.src || sourceElement.src !== this.src) {
          sourceElement.src = this.src;
        }

        var self = this,
          startTime = Date.now(),
          audioElementToPlay = this._audioElement;

        audioElementToPlay.removeEventListener("ended", window.audioEndListener);
        audioElementToPlay.removeEventListener("canplaythrough", window.actuallyPlayAudio);

        var audiourl = this.src;
        window.audioEndListener = function() {
          audioElementToPlay.removeEventListener("ended", window.audioEndListener);
          console.log("audiourl is done " + audiourl);
          // if (self._audioElement) {
          //   self._audioElement.currentTime = 0;
          // }
          self.isPlaying = false;
          self.isPaused = false;
          for (var i = 0; i < self.endAudioEvents.length; i++) {
            // self.endAudioEvents[i].whatShouldHappen.call();
            var eventName = self.endAudioEvents[i].whatShouldHappen;
            if (self.matchesSource(self.endAudioEvents[i].audioFile)) {
              console.log("Dispatching " + eventName);
              // self.application.dispatchEventNamed(eventName, true, false);
            }
          }
        };

        window.actuallyPlayAudio = function() {
          audioElementToPlay.removeEventListener("canplaythrough", window.actuallyPlayAudio);

          if (!delay) {
            self._audioElement.play();
            self.isPlaying = true;
            self.isPaused = false;
            self.audioPlayStarted = Date.now();
          } else {
            var timeToPrepareAudio = Date.now() - startTime;
            var newDelay = delay - timeToPrepareAudio;
            if (newDelay > 0) {
              setTimeout(function() {
                self._audioElement.play();
                self.isPlaying = true;
                self.isPaused = false;
                self.audioPlayStarted = Date.now();
              }, newDelay);
            } else {
              console.warn("Audio was " + newDelay + " late.");
              self._audioElement.play();
              self.isPlaying = true;
              self.isPaused = false;
              self.audioPlayStarted = Date.now();
            }
          }
        };
        console.log("Requested play of audio file when canplaythrough " + sourceElement);
        audioElementToPlay.addEventListener("ended", window.audioEndListener);
        audioElementToPlay.addEventListener("canplaythrough", window.actuallyPlayAudio);
        // call play if the audio is ready
        if (audioElementToPlay.readyState === 4) {
          window.actuallyPlayAudio.apply(audioElementToPlay, []);
        }

      } else {
        console.warn("there was no audio element to play");
      }
    }
  },

  pause: {
    value: function() {
      if (this._audioElement) {
        this._audioElement.pause();
        this.isPaused = true;
      }
    }
  },

  stop: {
    value: function() {
      if (this._audioElement) {
        this._audioElement.pause();
        this._audioElement.currentTime = 0;
      }
    }
  },

  audioEvents: {
    configurable: true,
    value: []
  },
  endAudioEvents: {
    configurable: true,
    value: []
  },

  audioTimeUpdateFunction: {
    configurable: true,
    value: function() {
      console.log(this.currentTime);
      if (!this.audioEvents) {
        return;
      }
      for (var i = 0; i < this.audioEvents.length; i++) {
        if (this.currentTime > this.audioEvents[i].startTime - 0.15 && this.currentTime < this.audioEvents[i].endTime) {
          this.audioEvents[i].whatShouldHappen.call();
        }
      }
    }
  },

  addAudioEventAtTimePeriod: {
    value: function(whatShouldHappen, startTime, endTime) {
      if (this._audioElement) {
        this._audioElement.removeEventListener("timeupdate", this.audioTimeUpdateFunction);
      }

      if (!endTime) {
        endTime = startTime + 1000;
      }
      var audioFile = whatShouldHappen.substring(whatShouldHappen.indexOf(":::")).replace(":::", "");
      whatShouldHappen = whatShouldHappen.replace(":::" + audioFile, "");
      if (startTime === "end") {
        this.endAudioEvents.push({
          whatShouldHappen: whatShouldHappen,
          audioFile: audioFile
        });
      } else {
        this.audioEvents.push({
          startTime: startTime,
          endTime: endTime,
          whatShouldHappen: whatShouldHappen,
          audioFile: audioFile
        });
      }

      if (this._audioElement) {
        this._audioElement.addEventListener("timeupdate", this.audioTimeUpdateFunction);
      }
    }
  }
});

exports.HTML5Audio = HTML5Audio;
