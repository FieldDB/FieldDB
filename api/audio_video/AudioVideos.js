var Collection = require("./../Collection").Collection;
var AudioVideo = require("./AudioVideo").AudioVideo;

/**
 * @class AudioVideos is a minimal customization of the Collection
 * to add an internal model of AudioVideo.
 *
 * @name  AudioVideos
 *
 * @extends Collection
 * @constructs
 */
var AudioVideos = function AudioVideos(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "AudioVideos";
  }
  this.debug("Constructing AudioVideos length: ", options);
  Collection.apply(this, arguments);
};

AudioVideos.prototype = Object.create(Collection.prototype, /** @lends AudioVideos.prototype */ {
  constructor: {
    value: AudioVideos
  },

  primaryKey: {
    value: "URL"
  },

  INTERNAL_MODELS: {
    value: {
      item: AudioVideo
    }
  },

  play: {
    value: function(optionalIndexToPlay) {
      console.log("playing");
      if (!optionalIndexToPlay) {
        optionalIndexToPlay = 0;
      }
      if (this._collection && this._collection[optionalIndexToPlay]) {
        this._collection[optionalIndexToPlay].play();
      }
    }
  }

});
exports.AudioVideos = AudioVideos;
