/* globals document, window, alert, navigator, FieldDB, Media */

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

  Object.apply(this, arguments);
};

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
    value: function(withVideo) {
      var application = {};
      if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
        application = FieldDB.FieldDBObject.application;
      }
      var waitUntilVideoElementIsRendered = function() {

        /* access camera and microphone
                    http://www.html5rocks.com/en/tutorials/getusermedia/intro/
                 */
        navigator.getUserMedia = navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;

        if (navigator.getUserMedia) {
          console.log("hasGetUserMedia");

          var video = document.getElementById("video-preview");
          var canvas = document.getElementById("video-snapshot-canvas");
          var snapshotImage = document.getElementById("video-snapshot");
          if (!canvas) {
            console.warn("video-snapshot-canvas is not present, cant verify periphialsCheck");
            return;
          }
          canvas.width = 640;
          canvas.height = 360;
          var ctx = canvas.getContext("2d");


          var errorCallback = function(e) {
            console.log("User refused access to camera and microphone!", e);
          };

          navigator.getUserMedia({
              video: {
                mandatory: {
                  maxWidth: canvas.width,
                  maxHeight: canvas.height
                }
              },
              audio: true,
              geolocation: true
            },
            function(localMediaStream) {
              if (withVideo) {
                video.removeAttribute("hidden");
                snapshotImage.removeAttribute("hidden");
              }
              video.src = window.URL.createObjectURL(localMediaStream);

              var takeSnapshot = function takeSnapshot() {
                if (localMediaStream) {
                  ctx.drawImage(video, 0, 0);
                  // "image/webp" works in Chrome.
                  // Other browsers will fall back to image/png.
                  snapshotImage.src = canvas.toDataURL("image/webp");
                }
              };
              video.addEventListener("click", takeSnapshot, false);


              // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
              // See crbug.com/110938.
              video.onloadedmetadata = function(e) {
                // Ready to go. Do some stuff.
                console.log("Video preview is working, take note of this in application so user can continue to the game.", e);
                application.videoRecordingVerified = true;

                navigator.geolocation.getCurrentPosition(function(position) {
                  console.warn("recieved position information");
                  if (FieldDB && FieldDB.FieldDBObject) {
                    FieldDB.FieldDBObject.software = FieldDB.FieldDBObject.software || {};
                    FieldDB.FieldDBObject.software.location = position.coords;
                  }
                });
              };
            },
            errorCallback
          );

        } else {
          alert("The Microphone is not supported in your browser");
        }
      };
      if (!document.getElementById("video-preview")) {
        window.setTimeout(waitUntilVideoElementIsRendered, 2000);
      } else {
        waitUntilVideoElementIsRendered();
      }
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
    value: function() {
      console.log("todo stop recording");
    }
  }
});

exports.AudioVideoRecorder = AudioVideoRecorder;
