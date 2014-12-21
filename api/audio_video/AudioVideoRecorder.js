/* globals document, window, alert, navigator, FieldDB, Media, FileReader, XMLHttpRequest, FormData */
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
      this.periphialsCheck(false);
    }
  },
  videoCheck: {
    value: function() {
      this.periphialsCheck(true);
    }
  },
  periphialsCheck: {
    value: function(withVideo, optionalElements) {
      var application = {},
        deferred = Q.defer(),
        self = this;

      Q.nextTick(function() {

        if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
          application = FieldDB.FieldDBObject.application;
        }
        var waitUntilVideoElementIsRendered = function() {
          if (!optionalElements) {
            optionalElements = {
              image: document.getElementById("video-snapshot"),
              video: document.getElementById("video-preview"),
              canvas: document.getElementById("video-snapshot-canvas"),
            };
          }
          if (!optionalElements.canvas) {
            console.warn("video-snapshot-canvas is not present, cant verify periphialsCheck");
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
            optionalElements.video.onloadedmetadata = function(e) {
              // Ready to go. Do some stuff.
              console.log("Video preview is working, take note of this in application so user can continue to the game.", e);
              application.videoRecordingVerified = true;
              if (self.type === "audio") {
                console.log("Turning of audio feedback since confirmed that the audio works.");
                delete optionalElements.video.src;
              }
              navigator.geolocation.getCurrentPosition(function(position) {
                console.warn("recieved position information");
                if (FieldDB && FieldDB.FieldDBObject) {
                  FieldDB.FieldDBObject.software = FieldDB.FieldDBObject.software || {};
                  FieldDB.FieldDBObject.software.location = position.coords;
                }
              });

              deferred.resolve("user clicked okay");
            };
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
            alert("The Microphone is not supported in your browser");
            deferred.reject("The microphone is not supported in your browser. " + navigator.userAgent);
            return;
          }

          var errorCallback = function(e) {
            console.log("User refused access to camera and microphone!", e);
            deferred.reject(e);
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
  uploadFile: {
    configurable: true,
    value: function(recorder, mp3Data, element) {
      var deferred = Q.defer();
      // callingContext = this;
      Q.nextTick(function() {
        console.log("todo upload recording");
        // callingContext.status = "Uploading";
        var reader = new FileReader();
        reader.onload = function(event) {
          var fd = new FormData();
          var mp3Name = "audio_recording_" + new Date().getTime() + ".mp3";
          var xhr = new XMLHttpRequest();
          var url = event.target.result;

          // Add audio element and download URL to page.
          var li = document.createElement("li");
          var au = document.createElement("audio");
          var hf = document.createElement("a");

          au.controls = true;
          au.src = url;
          hf.href = url;
          hf.download = mp3Name;
          hf.innerHTML = mp3Name;
          li.appendChild(au);
          li.appendChild(hf);
          console.log("todo dont need to append this audio after upload");
          element.appendChild(li);

          // callingContext.status += "\nmp3name = " + mp3Name;
          fd.append("fname", encodeURIComponent(mp3Name));
          fd.append("data", url);
          xhr.open("POST", "upload.php", true);
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              // callingContext.status += "\nMP3 uploaded.";
              recorder.clear();
            }
          };
          xhr.send(fd);
        };
        reader.readAsDataURL(mp3Data);

      });
      return deferred.promise;
    }
  }

});


RecordMP3.workerPath = "bower_components/recordmp3js/";
RecordMP3.uploadAudio = AudioVideoRecorder.prototype.uploadFile;
try {
  RecordMP3.AudioContext = window.AudioContext;
  RecordMP3.URL = window.URL;
} catch (e) {
  console.warn("Audio recorder won't work, AudioContext is not defined", e);
}

exports.AudioVideoRecorder = AudioVideoRecorder;
