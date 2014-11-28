var Datum = require("./Datum").Datum;

/**
 * @class The Stimulus is a minimal customization of a Datum which allows the user to add additional information
 *  which can be used for experiments.
 *
 * @name  Stimulus
 * @extends Datum
 * @constructs
 */
var Stimulus = function Stimulus(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Stimulus";
  }
  this.debug("Constructing Stimulus ", options);
  Datum.apply(this, arguments);
};

Stimulus.prototype = Object.create(Datum.prototype, /** @lends Stimulus.prototype */ {
  constructor: {
    value: Stimulus
  },

  prime: {
    get: function() {
      // if (this._prime) {
      return this._prime;
      // }
      // return {
      //   "imageFile": "x.png",
      //   "utterance": "χχ",
      //   "orthography": "xx",
      //   "audioFile": "prime.mp3"
      // };
    },
    set: function(value) {
      this._prime = value;
    }
  },

  target: {
    get: function() {
      // if (this._target) {
      return this._target;
      // }
      // return {
      //   "imageFile": "x.png",
      //   "utterance": "χχ",
      //   "orthography": "x",
      //   "audioFile": "target.mp3"
      // };
    },
    set: function(value) {
      this._target = value;
    }
  },

  distractors: {
    get: function() {
      // if (this._distractors) {
      return this._distractors;
      // }
      // return [{
      //   "imageFile": "placeholder.jpg",
      //   "utterance": "ʁχχ",
      //   "orthography": "rxx",
      //   "audioFile": "distractor.mp3"
      // }];
    },
    set: function(value) {
      this._distractors = value;
    }
  },

  layout: {
    get: function() {
      // if (this._layout) {
      return this._layout;
      // }
      // return {
      //   randomize: false,
      //   visualChoiceA: this.target,
      //   visualChoiceB: this.distractors[0]
      // };
    },
    set: function(value) {
      this._layout = value;
    }
  }

});
exports.Stimulus = Stimulus;
