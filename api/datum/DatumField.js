var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;

/**
 * @class The datum fields are the fields in the datum and session models.
 *        They can be freely added and should show up in the datum view
 *        according to frequency.
 *  @name  DatumField
 * @property size The size of the datum field refers to the width of the
 *           text area. Some of them, such as the judgment one will be very
 *           short, while others context can be infinitely long.
 * @property label The label that is associated with the field, such as
 *           Transcription, Morphemes, etc.
 * @property value This is what the user will enter when entering data into
 *           the data fields.
 * @property mask This allows users to mask fields for confidentiality.
 * @property shouldBeEncrypted This is whether the field is masked or not.
 * @property help This is a pop up that tells other users how to use the
 *           field the user has created.
 * @extends FieldDBObject
 * @constructs
 */
var DatumField = function DatumField(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "DatumField";
  }

  this.debug("Constructing DatumField ", options);
  // Let encryptedValue and value from serialization be set
  if (options && options.encryptedValue) {
    options._encryptedValue = options.encryptedValue;
  }
  if (options && options.value) {
    options._value = options.value;
  }
  FieldDBObject.apply(this, arguments);
};

DatumField.prototype = Object.create(FieldDBObject.prototype, /** @lends DatumField.prototype */ {
  constructor: {
    value: DatumField
  },

  defaults: {
    get: function() {
      return {
        id: Date.now(),
        labelFieldLinguists: "",
        labelPsychoLinguists: "",
        labelExperimenters: "",
        labelNonLinguists: "",
        labelTranslators: "",
        labelComputationalLinguist: "",
        type: "",
        shouldBeEncrypted: false,
        showToUserTypes: "all",
        defaultfield: false,
        value: "",
        mask: "",
        encrypted: "",
        json: {},
        help: "Put your team's data entry conventions here (if any)...",
        helpLinguists: "Put your team's data entry conventions here (if any)...",
        helpNonLinguists: "Put your team's data entry conventions here (if any)...",
        helpTranslators: "Put your team's data entry conventions here (if any)...",
        ComputationalLinguists: "Put your team's data entry conventions here (if any)...",
        helpDevelopers: "Put your team's data entry conventions here (if any)..."
      };
    }
  },

  // Internal models: used by the parse function
  internalModels: {
    value: {} // There are no nested models
  },

  id: {
    get: function() {
      return this._id || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._id) {
        return;
      }
      if (!value) {
        delete this._id;
        return;
      }
      if (value.trim) {
        value = value.trim();
      }
      var originalValue = value + "";
      value = this.sanitizeStringForPrimaryKey(value); //TODO dont do this on all objects
      if (value === null) {
        this.bug("Invalid id, not using " + originalValue + " id remains as " + this._id);
        return;
      }
      this._id = value;
    }
  },

  label: {
    get: function() {
      this.debug("label is deprecated, instead automatically contextualize a label for appropriate user eg labelFieldLinguists, labelNonLinguists, labelTranslators, labelComputationalLinguist");
      return this._labelFieldLinguists || this.id || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      this.debug("label is deprecated, instead automatically contextualize a label for appropriate user eg labelFieldLinguists,  labelNonLinguists, labelTranslators, labelComputationalLinguist");
      if (!this.labelFieldLinguists) {
        if (value && value.length > 2) {
          this.labelFieldLinguists = value[0].toUpperCase() + value.substring(1, value.length);
        } else {
          this.labelFieldLinguists = value;
        }
      }
      if (!this._id) {
        this.id = value;
      }
    }
  },

  userchooseable: {
    get: function() {
      this.debug("userchooseable is deprecated, instead use defaultfield");
      return this.defaultfield;
    },
    set: function(value) {
      this.debug("userchooseable is deprecated, instead use defaultfield");
      if (value === "disabled") {
        value = true;
      }
      if (!value) {
        value = false;
      }
      this.defaultfield = value;
    }
  },

  labelFieldLinguists: {
    get: function() {
      return this._labelFieldLinguists || this.label;
    },
    set: function(value) {
      if (value === this._labelFieldLinguists) {
        return;
      }
      if (!value) {
        delete this._labelFieldLinguists;
        return;
      }
      this._labelFieldLinguists = value.trim();
    }
  },

  labelPsychoLinguists: {
    get: function() {
      return this._labelPsychoLinguists || this.labelFieldLinguists;
    },
    set: function(value) {
      if (value === this._labelPsychoLinguists) {
        return;
      }
      if (!value) {
        delete this._labelPsychoLinguists;
        return;
      }
      this._labelPsychoLinguists = value.trim();
    }
  },

  labelExperimenters: {
    get: function() {
      return this._labelExperimenters || this.labelNonLinguists;
    },
    set: function(value) {
      if (value === this._labelExperimenters) {
        return;
      }
      if (!value) {
        delete this._labelExperimenters;
        return;
      }
      this._labelExperimenters = value.trim();
    }
  },

  labelNonLinguists: {
    get: function() {
      return this._labelNonLinguists || this.label;
    },
    set: function(value) {
      if (value === this._labelNonLinguists) {
        return;
      }
      if (!value) {
        delete this._labelNonLinguists;
        return;
      }
      this._labelNonLinguists = value.trim();
    }
  },

  labelTranslators: {
    get: function() {
      return this._labelTranslators || this.labelNonLinguists;
    },
    set: function(value) {
      if (value === this._labelTranslators) {
        return;
      }
      if (!value) {
        delete this._labelTranslators;
        return;
      }
      this._labelTranslators = value.trim();
    }
  },

  labelComputationalLinguist: {
    get: function() {
      return this._labelComputationalLinguist || this.label;
    },
    set: function(value) {
      if (value === this._labelComputationalLinguist) {
        return;
      }
      if (!value) {
        delete this._labelComputationalLinguist;
        return;
      }
      this._labelComputationalLinguist = value.trim();
    }
  },

  type: {
    get: function() {
      return this._type || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._type) {
        return;
      }
      if (!value) {
        delete this._type;
        return;
      }
      this._type = value.trim();
    }
  },

  shouldBeEncrypted: {
    get: function() {
      return this._shouldBeEncrypted || FieldDBObject.DEFAULT_FALSE;
    },
    set: function(value) {
      this.verbose("Setting shouldBeEncrypted " + value, this);

      if (value === this._shouldBeEncrypted) {
        return;
      }
      if (value === "checked") {
        value = true;
      }
      value = !!value;
      this.verbose("Setting shouldBeEncrypted " + value, this);
      if (this._shouldBeEncrypted === true && value === false) {
        this.warn("This field's shouldBeEncrypted cannot be undone. Only a corpus administrator can change shouldBeEncrypted to false if it has been true before.");
        return;
      }
      this._shouldBeEncrypted = value;
    }
  },

  encrypted: {
    get: function() {
      return this._encrypted || FieldDBObject.DEFAULT_FALSE;
    },
    set: function(value) {
      if (value === this._encrypted) {
        return;
      }
      if (!value) {
        delete this._encrypted;
        return;
      }
      if (value === "checked") {
        value = true;
      }
      this._encrypted = !!value;
    }
  },

  showToUserTypes: {
    get: function() {
      return this._showToUserTypes || "all";
    },
    set: function(value) {
      if (value === this._showToUserTypes) {
        return;
      }
      if (!value) {
        delete this._showToUserTypes;
        return;
      }
      this._showToUserTypes = value.trim();
    }
  },

  defaultfield: {
    get: function() {
      return this._defaultfield || FieldDBObject.DEFAULT_FALSE;
    },
    set: function(value) {
      if (value === this._defaultfield) {
        return;
      }
      if (!value) {
        delete this._defaultfield;
        return;
      }
      this._defaultfield = !!value;
    }
  },

  repairMissingEncryption: {
    value: true
  },

  value: {
    configurable: true,
    get: function() {
      this.debug("looking up the value of this field", this._value);
      if (this._value === undefined || this._value === null || this._value === "") {
        return FieldDBObject.DEFAULT_STRING;
      }
      // If there was a value before, there are extra precautions
      if (!this._shouldBeEncrypted) {
        return this._value;
      } else {
        if (!this.encrypted) {
          return this._value;
        } else {
          if (!this.decryptedMode) {
            if (this.mask) {
              this.warn("User is not able to view the value of " + this.label + ", it is encrypted and the user isn't in decryptedMode."); //" mask: "+ this._mask +" value: " +this._value);
            }
            return this.mask || FieldDBObject.DEFAULT_STRING;
          } else {
            if (!this._encryptedValue || this._encryptedValue.indexOf("confidential:") !== 0) {
              this.warn("The value was supposed to be encrypted but was not encrypted. This should not happen, it might only happen if an app was editing the data and didn't have the encryption implemented. Not overwritting the value.");
              if (this.repairMissingEncryption && this.confidential) {
                var encryptedValue = this.confidential.encrypt(this._value);
                this.warn(" Encrypting the value " + this._value);
                this._encryptedValue = encryptedValue;
                this._mask = this.createMask(this._value);
                this._value = this._mask;
              } else {
                return this._value;
              }
            }
            if (this._encryptedValue.indexOf("confidential:") === 0) {
              // All conditions are satisified, decrypt the value and give it to the user
              if (!this.confidential) {
                this.warn("This field's encrypter hasnt been set. It cannot be decrypted yet.");
                return this.mask;
              }
              var decryptedValue = this.confidential.decrypt(this._encryptedValue);
              if (this.type && this.type.indexOf("number") > -1) {
                var tryAsNumber = Number(decryptedValue);
                if (!isNaN(tryAsNumber)) {
                  decryptedValue = tryAsNumber;
                }
              }
              this.debug("decryptedValue " + decryptedValue);
              return decryptedValue;
            }
          }
        }
      }
      this.bug("The value wasn't returned, this should never happen and is a bug in the logic.");

    },
    set: function(value) {
      if (value === this._value) {
        return;
      }
      if (typeof value.trim === "function") {
        value = value.trim();
      }
      if (value === undefined || value === null || value === "" && !this._value) {
        return;
      }
      if (!value && this._value) {
        var fieldCanBeEmptied = !this._shouldBeEncrypted || (this._shouldBeEncrypted && this.decryptedMode);
        if (fieldCanBeEmptied) {
          this._value = "";
          this._mask = "";
          this._encryptedValue = "";
          return;
        } else {
          if (this._value) {
            this.warn("The value " + this._value + " of " + this.id + " was requested to be removed by the user, but they are not able to edit the field currently. No changes were made ");
          }
          return;
        }
      }
      var encryptedValue;
      if (!this._shouldBeEncrypted) {
        this._encryptedValue = value;
        this._mask = value;
        this._value = this._mask;
        return;
      } else {
        if (!this.encrypted) {
          this._encryptedValue = value;
          this._mask = value;
          this._value = this._mask;
          return;
        } else {
          if (!this._value) {
            // If there was no value before, set the new value

            if (!this.confidential) {
              if (typeof value.indexOf === "function" && value.indexOf("confidential:") === 0 && !this._encryptedValue) {
                this._encryptedValue = value;
                this._value = this.mask;
                this.debug("This is probably a new field initialization from old data (the value has \"confidential:\" in it, and yet the encryptedValue isn't set");
              } else {
                this.warn("This field's encrypter hasnt been set. It cannot be edited yet.");
              }
              return;
            }
            encryptedValue = this.confidential.encrypt(value);
            this._encryptedValue = encryptedValue;
            this._mask = this.createMask(value);
            this._value = this._mask;

          } else {

            // If there was a value before, there are extra precautions
            if (!this.decryptedMode) {
              this.warn("User is not able to change the value of " + this.label + ", it is encrypted and the user isn't in decryptedMode.");
              return;
            } else {
              if (!this._encryptedValue || this._encryptedValue.indexOf("confidential:") !== 0) {
                this.warn("The value was changed, and it was supposed to be encrypted but was not encrypted. This should not happen, it might only happen if an app was editing the data and didn't have the encryption implemented.");
                if (this.repairMissingEncryption && this.confidential) {
                  encryptedValue = this.confidential.encrypt(value);
                  this._encryptedValue = encryptedValue;
                  this._mask = this.createMask(value);
                  this._value = this._mask;
                  this.warn(" Overwritting the value.");
                } else {
                  this.warn(" Not overwritting the value.");
                  return;
                }
              }

              // All conditions are satisified, accept the new value.
              if (!this.confidential) {
                this.warn("This field's encrypter hasnt been set. It cannot be edited yet.");
                return;
              }
              encryptedValue = this.confidential.encrypt(value);
              this._encryptedValue = encryptedValue;
              this._mask = this.createMask(value);
              this._value = this._mask;

            }
          }
        }

      }
    }
  },

  mask: {
    get: function() {
      return this._mask || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._mask) {
        return;
      }
      if (!value) {
        delete this._mask;
        return;
      }
      this.debug("Setting datum field mask " + value);
      if (typeof value.trim === "function") {
        value = value.trim();
      }
      this._mask = value;
    }
  },


  encryptedValue: {
    get: function() {
      return this._encryptedValue || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (!value || value === this._encryptedValue) {
        return;
      }
      if (this._encryptedValue) {
        this.warn(this.id + " cannot be changed directly, instead you must be in decryptedMode ");
      }
      this.debug(" not setting " + value);
    }
  },

  json: {
    get: function() {
      return this._json || FieldDBObject.DEFAULT_OBJECT;
    },
    set: function(value) {
      if (value === this._json) {
        return;
      }
      if (!value) {
        delete this._json;
        return;
      }
      if (value && this._shouldBeEncrypted && !this.decryptedMode) {
        this.debug("encrypt json also");
      }
      this._json = value;
    }
  },

  help: {
    configurable: true,
    get: function() {
      return this._helpLinguists || this._help || "Put your team's data entry conventions here (if any)...";
    },
    set: function(value) {
      if (value === this._help) {
        return;
      }
      if (!value) {
        delete this._help;
        return;
      }
      this._help = value.trim();
      if (!this.helpLinguists) {
        this.helpLinguists = this._help;
      }
    }
  },

  helpLinguists: {
    get: function() {
      return this._helpLinguists || this.help;
    },
    set: function(value) {
      if (value === this._helpLinguists) {
        return;
      }
      if (!value) {
        delete this._helpLinguists;
        return;
      }
      this._helpLinguists = value.trim();
    }
  },

  helpNonLinguists: {
    get: function() {
      return this._helpNonLinguists || this.help;
    },
    set: function(value) {
      if (value === this._helpNonLinguists) {
        return;
      }
      if (!value) {
        delete this._helpNonLinguists;
        return;
      }
      this._helpNonLinguists = value.trim();
    }
  },

  helpTranslators: {
    get: function() {
      return this._helpTranslators || this.help;
    },
    set: function(value) {
      if (value === this._helpTranslators) {
        return;
      }
      if (!value) {
        delete this._helpTranslators;
        return;
      }
      this._helpTranslators = value.trim();
    }
  },

  helpComputationalLinguists: {
    get: function() {
      return this._helpComputationalLinguists || this.help;
    },
    set: function(value) {
      if (value === this._helpComputationalLinguists) {
        return;
      }
      if (!value) {
        delete this._helpComputationalLinguists;
        return;
      }
      this._helpComputationalLinguists = value.trim();
    }
  },

  helpDevelopers: {
    get: function() {
      return this._helpDevelopers || this.help;
    },
    set: function(value) {
      if (value === this._helpDevelopers) {
        return;
      }
      if (!value) {
        delete this._helpDevelopers;
        return;
      }
      this._helpDevelopers = value.trim();
    }
  },

  /**
   * Called before set and save, checks the attributes that the
   * user is attempting to set or save. If the user is trying to
   * set a mask on an encrypted datum field that should be encrypted, the only time they can do this is if the data is
   * in tempEncryptedVisible, with decryptedMode on.
   *
   * @param attributes
   */
  validate: {
    value: function(attributes) {
      this.tood("Vaidating is commented out ", attributes);
      //      if(attributes.mask){
      //        if(attributes.shouldBeEncrypted !== "checked" ){
      //          //user can modify the mask, no problem.
      //        }else if(attributes.encrypted !== "checked" ){
      //          //user can modify the mask, no problem.
      //        }else if( attributes.encrypted === "checked" &&
      ////            attributes.tempEncryptedVisible === "checked"  &&
      //            attributes.shouldBeEncrypted === "checked" &&
      //              this.corpus.confidential.decryptedMode ){
      //          //user can modify the mask, no problem.
      //        }else if( attributes.mask !== this.mask ){
      //          return "The datum is presently encrypted, the mask cannot be set by anything other than the model itself.";
      //        }
      //      }
      //      if( attributes.value ){
      //
      //        if(this.value && this.value.indexOf("confidential") === 0){
      //          return "Cannot modify the value of a confidential datum field directly";
      //        }
      //
      //        if(attributes.shouldBeEncrypted !== "checked" ){
      //          //user can modify the value, no problem.
      //        }else if(attributes.encrypted !== "checked" ){
      //          //user can modify the value, no problem.
      //        }else if( attributes.encrypted === "checked" &&
      ////            attributes.tempEncryptedVisible === "checked"  &&
      //            attributes.shouldBeEncrypted === "checked" &&
      //              this.corpus.confidential.decryptedMode ){
      //          //the user/app can modify the value, no problem.
      //        }else if( attributes.value !== this.value ){
      //          return "The value cannot be set by anything other than the model itself, from a mask.";
      //        }
      //      }
    }
  },

  /**
   * In the case of the datumfield, if the datum
   * field is not encrypted, then the mask and value are essentially the same.
   * If however the datum is supposed to be encrypted, the value needs to
   * start with confidential, and the mask should be xxxx representign
   * words/morphemes which are allowed to be shown.
   * http://stackoverflow.com/questions/11315844/what-is-the-correct-way-in-backbone-js-to-listen-and-modify-a-model-property
   *
   * @param key
   * @param value
   * @param options
   * @returns null
   */
  upgrade: {
    value: function(attributes, options) {

      options = options || {};
      // do any other custom property changes here
      /*
       * Copy the mask, value and shouldBeEncrypted and encrypted from the object if it is not being set.
       */
      if (attributes.mask === undefined && this.mask) {
        attributes.mask = this.mask;
      }
      if (attributes.value === undefined && this.value) {
        attributes.value = this.value;
      }
      if (attributes.shouldBeEncrypted === undefined && this.shouldBeEncrypted) {
        attributes.shouldBeEncrypted = this.shouldBeEncrypted;
      }
      if (attributes.encrypted === undefined && this.encrypted) {
        attributes.encrypted = this.encrypted;
      }

      if ((attributes.mask && attributes.mask !== "")) {

        if (attributes.shouldBeEncrypted !== "checked") {
          //Don't do anything special, this field doesnt get encrypted when the data is confidential
          attributes.value = attributes.mask;
        } else if (attributes.encrypted !== "checked") {
          //Don't do anything special, this datum isn't confidential
          attributes.value = attributes.mask;


          /*
           * A, B, C, D: If we are supposed to be encrypted, and we are encrypted, but we want to let the user see the data to change it.
           *
           */
        } else if (this.corpus.confidential.decryptedMode) {

          /*
           * A: If it wasn't encrypted, encrypt the value, and leave the mask as the original value for now,
           * can happen when the user clicks on the lock button for the first time.
           */
          if (attributes.mask.indexOf("confidential:") !== 0) {
            //          attributes.mask = attributes.mask;//leave mask open
            //save the mask encrpyted as the new value, this is triggered when the user modifies the data
            attributes.value = this.corpus.confidential.encrypt(attributes.mask);
            /*
             * B: A strange case which is used by the Datum Save function, to trigger the mask into the xxx version of the current value that it will be saved in the data base with xxx.
             */
          } else if (attributes.mask.indexOf("confidential:") === 0) {
            attributes.mask = this.mask(this.corpus.confidential.decrypt(this.value));
            attributes.value = this.value; //don't let the user modify the value.
          }

          /*
           * C & D: this should never be called since the value is supposed to come from the mask only.
           */

          /*
           * C: If the value wasn't encrypted, encrypt the value, and leave the mask as the original value since we are in decryptedMode
           */
          if (attributes.value && attributes.value.indexOf("confidential") !== 0) {
            //          attributes.mask = attributes.mask;//leave mask open
            attributes.value = this.corpus.confidential.encrypt(attributes.mask);
            /*
             * D: If the value was encrypted, there is some sort of bug, leave the value as it was, decrypt it and put it in to the mask since we are in decryptedMode
             */
          } else if (attributes.value && attributes.value.indexOf("confidential") === 0) {
            // If it was encrypted, turn the mask into the decrypted version of the current value so the user can see it.
            //this might get called at the same time as the first mask if above
            attributes.mask = this.corpus.confidential.decrypt(this.value);
            attributes.value = this.value; //don't let the user modify the value.
          }

          /*
           * E, F, G, H: If we are supposed to be encrypted and we are encrypted, but we are not in decrypted mode.
           */
        } else {

          //Don't let the user take off encryption if they are not in decryptedMode
          if (this.encrypted === "checked") {
            if (true && attributes.encrypted !== "checked" && !this.corpus.confidential.decryptedMode) {
              attributes.encrypted = "checked";
            }
          }

          /*
           * E: A strange case which is used by the Datum Save function, to trigger the mask into the xxx version of the current value that it will be saved in the data base with xxx.
           *  (Same as B above)
           */
          if (attributes.mask && attributes.mask.indexOf("confidential") === 0) {
            attributes.mask = this.mask(this.corpus.confidential.decrypt(this.value));
            attributes.value = this.value; //don't let the user modify the value.
            /*
             * F: If the value is encrypted, then the mask is probably set, don't let the user change anything since they shouldn't be able to see the data anyway.s
             */
          } else {
            //Don't let user change value of confidential or mask: see validate function
            attributes.mask = this.mask;
            attributes.value = this.value;
          }

          /*
           * G: If the data is not encrypted, encrypt it and mask it in the mask. This might be called the first time a user clicks on the lock to first encrypts the value.
           * (Similar to C above, except that we mask the mask)
           */
          if (attributes.value && attributes.value.indexOf("confidential") !== 0) {
            attributes.mask = this.mask(this.value); //use value to make mask
            attributes.value = this.corpus.confidential.encrypt(this.value);
            /*
             * H: If the value is encrypted, then the mask is probably set, don't let the user change anything since they shouldn't be able to see the data anyway.s
             */
          } else {
            //Don't let user change value of confidential or mask: see validate function
            attributes.mask = this.mask;
            attributes.value = this.value;
          }
        }
      } else {
        //        alert("The datum field has no mask, there is a bug somewhere.");
        //        attributes.value ="";
        //        attributes.mask = "";
      }
      return attributes;
    }
  },

  createMask: {
    value: function(stringToMask) {
      stringToMask = stringToMask || "";
      stringToMask = stringToMask + "";
      return stringToMask.replace(/[^_=., -]/g, "x");
    }
  },

  saveAndInterConnectInApp: {
    value: function(callback) {

      if (typeof callback === "function") {
        callback();
      }
    }
  },

  confidential: {
    get: function() {
      return this.confidentialEncrypter;
    },
    set: function(value) {
      if (value === this.confidentialEncrypter) {
        return;
      }
      if (typeof value.encrypt !== "function" && value.secretkey) {
        value = new Confidential(value);
      }
      this.confidentialEncrypter = value;
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);
      includeEvenEmptyAttributes = true;
      var json = FieldDBObject.prototype.toJSON.apply(this, arguments);
      delete json.dateCreated;
      delete json.dateModified;
      delete json.comments;
      delete json.dbname;

      // TODO eventually dont include the label and hint but now include it for backward compaitibilty
      json.label = this.id;
      json.hint = this.hint || "";

      json.value = this.value || "";
      json.mask = this.mask || "";

      json.id = this.id;
      delete json._id;

      json.fieldDBtype = this.fieldDBtype;
      delete json._type;

      this.debug(json);
      return json;
    }
  }

});

exports.DatumField = DatumField;
