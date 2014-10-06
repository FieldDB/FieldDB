/* globals FieldDB */
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

/**
 * @class The AudioVideo is a type of FieldDBObject with any additional fields or
 * metadata that a team might use to ground/tag their primary data.
 *
 *
 * @name  AudioVideo
 * @extends FieldDBObject
 * @constructs
 */
var AudioVideo = function AudioVideo(options) {
  this.debug("Constructing AudioVideo length: ", options);
  FieldDBObject.apply(this, arguments);
  this._fieldDBtype = "AudioVideo";
};

var DEFAULT_BASE_SPEECH_URL = "https://localhost:6984";
AudioVideo.prototype = Object.create(FieldDBObject.prototype, /** @lends AudioVideo.prototype */ {
  constructor: {
    value: AudioVideo
  },

  BASE_SPEECH_URL: {
    get: function() {
      return DEFAULT_BASE_SPEECH_URL;
    },
    set: function(value) {
      DEFAULT_BASE_SPEECH_URL = value;
    }
  },

  api: {
    value: "speech"
  },

  id: {
    get: function() {
      return this._URL || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._URL) {
        return;
      }
      if (!value) {
        delete this._URL;
        return;
      }
      if (value.trim) {
        value = value.trim();
      }
      this._URL = value;
    }
  },

  URL: {
    get: function() {
      if (!this._URL && this.filename) {
        var baseUrl = this.url ? this.url : this.BASE_SPEECH_URL;
        return baseUrl + "/" + this.dbname + "/" + this.filename;
      }
      return this._URL || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._URL) {
        return;
      }
      if (!value) {
        delete this._URL;
        return;
      }
      if (value.trim) {
        value = value.trim();
      }
      this._URL = value;
    }
  },

  type: {
    get: function() {
      if (!this._type && this.filename) {
        this._type = "audio/" + this.filename.split(".").pop();
      }
      return this._type || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._type) {
        return;
      }
      console.warn("type cannot be set, it is automatically determined from the filename. Not using: " + value);
      if (this.filename) {
        value = "audio/" + this.filename.split(".").pop();
        this._type = value;
      }
    }
  }


});
exports.AudioVideo = AudioVideo;
