var Stimulus = require("./Stimulus").Stimulus,
  Q = require("q");

/**
 * @class The Response is a minimal customization of a Stimulus which allows the user to add additional information
 *  which can be used for experiments.
 *
 * @name  Response
 * @extends Stimulus
 * @constructs
 */
var Response = function Response(options) {
  this.debug("Constructing Response ", options);
  Stimulus.apply(this, arguments);
  this._fieldDBtype = "Response";
};

Response.prototype = Object.create(Stimulus.prototype, /** @lends Response.prototype */ {
  constructor: {
    value: Response
  },

  jsonType: {
    get: function() {
      return this.fieldDBtype;
    }
  },

  collection: {
    get: function() {
      return this.fieldDBtype;
    }
  },

  // responses: {
  //   value: null,
  //   configurable: true
  // },

  pauseAudioWhenConfirmingResponse: {
    value: null,
    configurable: true

  },

  addResponse: {
    value: function(responseEvent, stimulusId) {
      if (!responseEvent) {
        throw "Cannot add response without the x y information found in the touch/click responseEvent";
      }

      var reactionTimeEnd = Date.now();
      var audioDuration = this.application.audioPlayer.getDuration(this.audioFile) || 0;
      if (audioDuration) {
        audioDuration = audioDuration * 1000;
      } else {
        console.log("The audio has no duration.. This is strange.");
      }
      if (this.pauseAudioWhenConfirmingResponse) {
        this.pauseAudio();
      }

      var self = this;
      var continueToNextStimulus = Q.defer();
      if (this.confirmResponseChoiceMessage) {
        this.contextualizer.currentLocale = this.application.interfaceLocale;
        var confirmChoicePrompt = this.contextualizer.localize(this.confirmResponseChoiceMessage);
        var options = {
          iconSrc: self.ownerComponent.iconSrc,
          message: confirmChoicePrompt
        };
        this.confirm(options.message).then(function() {
          continueToNextStimulus.resolve();
        }, function() {
          continueToNextStimulus.reject(new Error("The x prevented the cancel?"));
        });
      } else {
        continueToNextStimulus.resolve();
      }
      continueToNextStimulus.promise.then(function() {
        // self.ownerComponent.templateObjects.reinforcement.next();
        self.stopAudio();
        self.ownerComponent.nextStimulus();
      }, function(reason) {
        console.log("Not continuing to next stimulus",reason);
        if (this.pauseAudioWhenConfirmingResponse) {
          self.playAudio();
        }
      });
      var choice = "";
      if (stimulusId) {
        choice = this[stimulusId].substring(this[stimulusId].lastIndexOf("/") + 1).replace(/\..+$/, "").replace(/\d+_/, "");
        if (choice === this.target.orthographic) {
          choice = this.target;
        } else {
          this.distractors.map(function(distractor) {
            if (choice === distractor.orthographic) {
              choice = distractor;
            }
          });
        }
      }
      var response = {
        "reactionTimeAudioOffset": reactionTimeEnd - this.reactionTimeStart - audioDuration,
        "reactionTimeAudioOnset": reactionTimeEnd - this.reactionTimeStart,
        "x": responseEvent.x,
        "y": responseEvent.y,
        "pageX": responseEvent.pageX,
        "pageY": responseEvent.pageY,
        // "prime": {
        //  phonemic: this.prime.phonemic,
        //  orthographic: this.prime.orthographic,
        //  imageFile: this.prime.imageFile
        // },
        "choice": choice,
        // "target": this.target,
        "score": this.scoreResponse(this.target, choice)
      };
      this.responses.push(response);
      console.log("Recorded response", JSON.stringify(response));
    }
  },

  addOralResponse: {
    value: function(choice, dontAutoAdvance) {
      var reactionTimeEnd = Date.now();
      var audioDuration = this.application.audioPlayer.getDuration(this.audioFile) || 0;
      if (audioDuration) {
        audioDuration = audioDuration * 1000;
      } else {
        console.log("The audio has no duration.. This is strange.");
      }
      if (this.pauseAudioWhenConfirmingResponse) {
        this.pauseAudio();
      }

      var self = this;
      var continueToNextStimulus = Q.defer();
      if (this.confirmResponseChoiceMessage) {
        this.contextualizer.currentLocale = this.application.interfaceLocale;
        var confirmChoicePrompt = this.contextualizer.localize(this.confirmResponseChoiceMessage);
        var options = {
          iconSrc: self.ownerComponent.iconSrc,
          message: confirmChoicePrompt
        };
        this.confirm(options.message).then(function() {
          continueToNextStimulus.resolve();
        }, function() {
          continueToNextStimulus.reject(new Error("The x prevented the cancel?"));
        });
      } else {
        if (!dontAutoAdvance) {
          continueToNextStimulus.resolve();
        }
      }
      continueToNextStimulus.promise.then(function() {
        // self.ownerComponent.templateObjects.reinforcement.next();
        self.stopAudio();
        self.ownerComponent.nextStimulus();
      }, function(reason) {
        console.log("Not continuing to next stimulus", reason);
        if (this.pauseAudioWhenConfirmingResponse) {
          self.playAudio();
        }
      });

      var response = {
        "reactionTimeAudioOffset": reactionTimeEnd - this.reactionTimeStart - audioDuration,
        "reactionTimeAudioOnset": reactionTimeEnd - this.reactionTimeStart,
        "x": 0,
        "y": 0,
        "pageX": 0,
        "pageY": 0,
        "choice": choice,
        "score": choice.score
      };
      this.responses = this.responses || [];
      this.responses.push(response);
      console.log("Recorded response", JSON.stringify(response));
    }
  },

  scoreResponse: {
    value: function(expectedResponse, actualResponse) {
      if (!actualResponse.orthographic) {
        return "error";
      }
      if (actualResponse.orthographic === expectedResponse.orthographic) {
        return 1;
      } else {
        return 0;
      }
    }
  },

  addNonResponse: {
    value: function(responseEvent) {
      if (!responseEvent) {
        throw "Cannot add response without the x y information found in the touch/click responseEvent";
      }
      var reactionTimeEnd = Date.now();
      var response = {
        "reactionTimeAudioOffset": reactionTimeEnd - this.reactionTimeStart,
        "reactionTimeAudioOnset": reactionTimeEnd - this.reactionTimeStart,
        "x": responseEvent.x,
        "y": responseEvent.y,
        "pageX": responseEvent.pageX,
        "pageY": responseEvent.pageY,
        "chosenVisualStimulus": "none",
        "responseScore": -1
      };
      this.responses = this.responses || [];
      this.nonResponses.push(response);
      console.log("Recorded non-response, the user is confused or not playing the game.", JSON.stringify(response));
    }
  },

  /**
   *  TODO try using a media controller later montage/ui/controller/media-controller
   * @type {Object}
   */
  playAudio: {
    value: function(delay) {
      this.application.audioPlayer.play(this.audioFile, delay);
    }
  },

  pauseAudio: {
    value: function() {
      this.application.audioPlayer.pause(this.audioFile);
    }
  },

  stopAudio: {
    value: function() {
      this.application.audioPlayer.stop(this.audioFile);
    }
  },

  load: {
    value: function(details) {
      for (var d in details) {
        if (details.hasOwnProperty(d)) {
          this[d] = details[d];
        }
      }
      if (this.responses === null) {
        this.responses = [];
      }
      if (this.nonResponses === null) {
        this.nonResponses = [];
      }
      this.nonResponses = [];
      this.experimenterId = this.application.experiment.experimenter.id;
      this.participantId = this.application.experiment.participant.id;
      // Not playing audio by default, child must call it.
      // this.playAudio(2000);
    }
  }

});
exports.Response = Response;
