var AudioVideo = require("./../audio_video/AudioVideo").AudioVideo;

/**
 * @class The Image is a type of AudioVideo with any additional fields or
 * metadata that a team might use to visually ground their data.
 *
 * @name  Image
 * @extends AudioVideo
 * @constructs
 */
var Image = function Image(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Image";
  }
  this.debug("Constructing Image length: ", options);
  AudioVideo.apply(this, arguments);
};

Image.prototype = Object.create(AudioVideo.prototype, /** @lends Image.prototype */ {
  constructor: {
    value: Image
  },

  api: {
    value: "images"
  }

});
exports.Image = Image;
