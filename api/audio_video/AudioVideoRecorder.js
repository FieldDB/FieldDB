/* globals document, window, navigator, FieldDB, Media, FileReader */
var Q = require("q");
var RecordMP3 = require("recordmp3js/js/recordmp3");

/**
 * @class AudioVideoRecorder is a minimal customization of the HTML5 media controller
 *
 * @name AudioVideoRecorder
 *
 * @extends Object
 * @constructs
 */
var AudioVideoRecorder = function AudioVideoRecorder(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "AudioVideoRecorder";
  }
  if (this.options) {
    console.log("AudioVideoRecorder was created with options but it doesnt accept options", options);
  }
  if (options && options.element) {
    this.element = options.element;
  }

  Object.apply(this, arguments);
};
AudioVideoRecorder.Recorder = RecordMP3.Recorder;

AudioVideoRecorder.prototype = Object.create(Object.prototype, /** @lends AudioVideoRecorder.prototype */ {
  constructor: {
    value: AudioVideoRecorder
  },

  isRecording: {
    configurable: true,
    get: function() {
      return this._isRecording;
    }
  },

  element: {
    get: function() {
      if (this.recorder) {
        return this.recorder.element;
      } else {
        return null;
      }
    },
    set: function(element) {
      if (!element) {
        console.warn("Cannot create an audio recorder, element was not passed in.");
        return;
      }
      try {
        this.recorder = new RecordMP3.Recorder({
          element: element
        });
      } catch (e) {
        console.warn("Cannot create an audio recorder.", e);
      }
    }
  },

  parent: {
    get: function() {
      if (this.recorder) {
        return this.recorder.parent;
      } else {
        return null;
      }
    },
    set: function(parent) {
      if (!parent || !this.recorder) {
        console.warn("Cannot set parent on a missing audio recorder, parent was not passed in.");
        return;
      }
      this.recorder.parent = RecordMP3.parent = parent;
    }
  },

  isPaused: {
    configurable: true,
    get: function() {
      return this._isPaused;
    }
  },

  recorderStartTime: {
    configurable: true,
    get: function() {
      if (this._recordingStartTime) {
        return this._recordingStartTime;
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
        console.log("We are most likely not in Cordova, using HTML5 audio", e);
        return false;
      }
    }
  },

  getDuration: {
    configurable: true,
    value: function() {
      return 0;
    }
  },

  microphoneCheck: {
    value: function() {
      this.peripheralsCheck(false);
    }
  },
  videoCheck: {
    value: function() {
      this.peripheralsCheck(true);
    }
  },
  peripheralsCheck: {
    value: function(withVideo, optionalElements) {
      var application = {},
        deferred = Q.defer(),
        self = this;

      if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
        application = FieldDB.FieldDBObject.application;
      }
      var errorInAudioVideoPeripheralsCheck = function(error) {
        application.videoRecordingVerified = false;
        application.audioRecordingVerified = false;
        deferred.reject(error);
      };

      Q.nextTick(function() {
        if(self.peripheralsCheckRunning){
          deferred.reject("Already running");
          return;
        }
        self.peripheralsCheckRunning = true;

        var waitUntilVideoElementIsRendered = function() {
          if (!optionalElements) {
            optionalElements = {
              image: document.getElementById("video-snapshot"),
              video: document.getElementById("video-preview"),
              audio: document.getElementById("audio-preview"),
              canvas: document.getElementById("video-snapshot-canvas"),
            };
          }
          if (!optionalElements.canvas) {
            errorInAudioVideoPeripheralsCheck("video-snapshot-canvas is not present, cant verify peripheralsCheck");
            return;
          }
          optionalElements.canvas.width = 640;
          optionalElements.canvas.height = 360;
          var ctx = optionalElements.canvas.getContext("2d");
          var displayMediaPreview = function(localMediaStream) {
            if (localMediaStream) {
              RecordMP3.audio_context = new RecordMP3.AudioContext();
              RecordMP3.audio_source = RecordMP3.audio_context.createMediaStreamSource(localMediaStream);
            }

            if (withVideo) {
              optionalElements.video.removeAttribute("hidden");
              optionalElements.image.removeAttribute("hidden");
              optionalElements.video.removeAttribute("class");
              optionalElements.image.removeAttribute("class");
              self.type = "video";
              optionalElements.video.src = window.URL.createObjectURL(localMediaStream);
            } else {
              self.type = "audio";
              optionalElements.audio.removeAttribute("hidden");
              optionalElements.audio.removeAttribute("class");
              optionalElements.audio.src = window.URL.createObjectURL(localMediaStream);
            }

            var takeSnapshot = function takeSnapshot() {
              if (localMediaStream) {
                ctx.drawImage(optionalElements.video, 0, 0);
                // "image/webp" works in Chrome.
                // Other browsers will fall back to image/png.
                optionalElements.image.src = optionalElements.canvas.toDataURL("image/webp");
              }
            };
            optionalElements.video.addEventListener("click", takeSnapshot, false);


            // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
            // See crbug.com/110938.
            var onmedialoaded = function(e) {
              // Ready to go. Do some stuff.
              console.log("Video preview is working, take note of this in application so user can continue to the game.", e);
              application.videoRecordingVerified = true;
              application.audioRecordingVerified = true;
              console.log("Turning of audio feedback since confirmed that the audio works.");
              optionalElements.audio.muted = true;
              optionalElements.video.muted = true;
              navigator.geolocation.getCurrentPosition(function(position) {
                console.warn("recieved position information");
                if (FieldDB && FieldDB.FieldDBObject) {
                  FieldDB.FieldDBObject.software = FieldDB.FieldDBObject.software || {};
                  FieldDB.FieldDBObject.software.location = position.coords;
                }
              });

              deferred.resolve("user clicked okay");
            };
            optionalElements.audio.onloadeddata = onmedialoaded;
            optionalElements.audio.onloadedmetadata = onmedialoaded;
            optionalElements.video.onloadeddata = onmedialoaded;
            optionalElements.video.onloadedmetadata = onmedialoaded;

          };

          if (application.videoRecordingVerified) {
            displayMediaPreview();
            deferred.resolve();
            return;
          }

          /* access camera and microphone
              http://www.html5rocks.com/en/tutorials/getusermedia/intro/
           */
          navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

          if (!navigator.getUserMedia) {
            errorInAudioVideoPeripheralsCheck("The Microphone/Camera is not supported in your browser.");
            return;
          }

          var errorCallback = function(e) {
            console.warn("Error in peripheralsCheck", e);
            errorInAudioVideoPeripheralsCheck("User refused access to camera and microphone!", e);
            return;
          };

          navigator.getUserMedia({
              video: {
                mandatory: {
                  maxWidth: optionalElements.canvas.width,
                  maxHeight: optionalElements.canvas.height
                }
              },
              audio: true,
              geolocation: true
            },
            displayMediaPreview,
            errorCallback
          );
        };

        if (!optionalElements.video) {
          console.warn("waiting for the video preview to get rendered, did you forget to declare it somewhere? ");
          window.setTimeout(waitUntilVideoElementIsRendered, 2000);
        } else {
          waitUntilVideoElementIsRendered();
        }
      });
      return deferred.promise;
    }
  },
  record: {
    configurable: true,
    value: function(optionalSource, optionalDelay) {
      console.log("todo record " + this._src + " optionalSource " + optionalSource + " optionalDelay " + optionalDelay);
    }
  },

  pause: {
    configurable: true,
    value: function() {
      console.log("todo pause recording");
    }
  },

  togglePause: {
    configurable: true,
    value: function() {
      console.log("todo toogle pause recording");
    }
  },

  stop: {
    configurable: true,
    value: function(optionalFormat) {
      var deferred = Q.defer();
      Q.nextTick(function() {
        console.log("todo stop recording", optionalFormat);
      });
      return deferred.promise;
    }
  },

  exportRecording: {
    configurable: true,
    value: function(optionalFormat) {
      var deferred = Q.defer();
      Q.nextTick(function() {
        console.log("todo export recording", optionalFormat);
      });
      return deferred.promise;
    }
  },

  /**
   * Creates an audio element and uploads the file, and makes it so you can download the file.
   * @param  {RecordMP3.Recorder} recorder Reference to the recorder object (this function is called in a cllback in the recorder)
   * @param  {Blob} mp3Data  [description]
   * @param  {DOMElement} element  [description]
   * @return {Promise}          [description]
   */
  showFile: {
    configurable: true,
    value: function(recorder, mp3Data, element) {
      var deferred = Q.defer(),
        callingContext = this;
      console.log("showing file on ", element);
      Q.nextTick(function() {
        // callingContext. = "Uploading";
        var reader = new FileReader();
        reader.onload = function(event) {
          // var fd = new FormData();
          var mp3Name = "audio_recording_" + new Date().getTime() + ".mp3";
          // var xhr = new XMLHttpRequest();
          var url = event.target.result;

          // Add audio element and download URL to page.
          var showAudioArea = document.createElement("p");
          var au = document.createElement("audio");
          au.classList = ["fielddb-audio-temp-play-audio"];
          var hf = document.createElement("a");
          hf.classList = ["fielddb-audio-temp-save-link"];
          hf.innerText = "Save to this device";
          au.controls = true;
          au.src = url;
          hf.href = url;
          hf.download = mp3Name;
          hf.innerHTML = mp3Name;
          showAudioArea.appendChild(au);
          au.play();
          showAudioArea.appendChild(hf);
          console.log("todo dont need to append this audio after upload");

          element.appendChild(showAudioArea);
          callingContext.parent.addFile({
            filename: mp3Name,
            description: "Recorded using spreadsheet app",
            data: url
          });
          // callingContext.status += "\nmp3name = " + mp3Name;
          // fd.append("filename", encodeURIComponent(mp3Name));

          // xhr.open("POST", new FieldDB.AudioVideo().BASE_SPEECH_URL + "/upload/extract/utterances", true);
          // xhr.onreadystatechange = function(response) {
          //   console.log(response);
          //   if (xhr.readyState === 4) {
          //     // callingContext.status += "\nMP3 uploaded.";
          //     // recorder.clear();

          //   }
          //   console.warn("dont clear if upload fialed");
          // };
          // xhr.send(fd);
            recorder.clear();
        };
        reader.readAsDataURL(mp3Data);

      });
      return deferred.promise;
    }
  }

});


RecordMP3.workerPath = "bower_components/recordmp3js/";
RecordMP3.showFile = AudioVideoRecorder.prototype.showFile;
try {
  RecordMP3.AudioContext = window.AudioContext;
  RecordMP3.URL = window.URL;
} catch (e) {
  console.warn("Audio recorder won't work, AudioContext is not defined", e);
}

exports.AudioVideoRecorder = AudioVideoRecorder;
