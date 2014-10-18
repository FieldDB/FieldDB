/* globals document, window, alert, navigator, FieldDB, Media */
var Q = require("q");

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
    value: function(withVideo, optionalElements) {
      var application = {},
        deferred = Q.defer();

      Q.nextTick(function() {

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
              function(localMediaStream) {
                if (withVideo) {
                  optionalElements.video.removeAttribute("hidden");
                  optionalElements.image.removeAttribute("hidden");
                }
                optionalElements.video.src = window.URL.createObjectURL(localMediaStream);

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

                  navigator.geolocation.getCurrentPosition(function(position) {
                    console.warn("recieved position information");
                    if (FieldDB && FieldDB.FieldDBObject) {
                      FieldDB.FieldDBObject.software = FieldDB.FieldDBObject.software || {};
                      FieldDB.FieldDBObject.software.location = position.coords;
                    }
                  });

                  deferred.resolve("user clicked okay");
                };
              },
              errorCallback
            );

          } else {
            alert("The Microphone is not supported in your browser");
            deferred.reject("The microphone is not supported in your browser. " + navigator.userAgent);
          }
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
    value: function() {
      console.log("todo stop recording");
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

  uploadFile: {
    configurable: true,
    value: function() {
      var deferred = Q.defer();
      Q.nextTick(function() {
        console.log("todo upload recording");
      });
      return deferred.promise;
    }
  }

});

exports.AudioVideoRecorder = AudioVideoRecorder;
