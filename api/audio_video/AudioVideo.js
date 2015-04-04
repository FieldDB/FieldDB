var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var AudioPlayer = require("./AudioPlayer").AudioPlayer;
var mime = require("browserify-mime");
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
  if (!this._fieldDBtype) {
    this._fieldDBtype = "AudioVideo";
  }
  this.debug("Constructing AudioVideo length: ", options);
  FieldDBObject.apply(this, arguments);
};

var DEFAULT_BASE_SPEECH_URL = "https://localhost:3184";
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
      if (this.audioPlayer) {
        this.audioPlayer.src = value;
      }
    }
  },

  play: {
    value: function(optionalStartTime, optionalEndTime, optionalDuration) {
      this.warn("playing", this, optionalStartTime, optionalEndTime, optionalDuration);
      this.audioPlayer = this.audioPlayer || new AudioPlayer();
      this.audioPlayer.play(this.URL);
    }
  },

  guessType: {
    value: function(filename) {
      var guessedType = mime.lookup(filename);
      return guessedType;
    }
  },

  type: {
    get: function() {
      if (!this._type && this.filename) {
        this._type = this.guessType(this.filename);
      }
      return this._type || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._type) {
        return;
      }
      if (this.filename && !this.checksum) {
        this.warn("type cannot be set, it is automatically determined from the filename. Not using: " + value);
        value = this.guessType(this.filename);
      }
      this._type = value;
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);
      var json = FieldDBObject.prototype.toJSON.apply(this, arguments);
      delete json.audioPlayer;
      json.type = this.type;

      return json;
    }
  }


});
exports.AudioVideo = AudioVideo;
