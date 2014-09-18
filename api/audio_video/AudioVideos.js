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
  }

});
exports.AudioVideos = AudioVideos;
