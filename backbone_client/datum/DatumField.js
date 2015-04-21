define([
    "backbone"
], function(
    Backbone
) {
  var DatumField = Backbone.Model.extend(
  /** @lends DatumField.prototype */
  {
    /**
     * @class The datum fields are the fields in the datum and session models.
     *        They can be freely added and should show up in the datum view
     *        according to frequency.
     *
     * @property size The size of the datum field refers to the width of the
     *           text area. Some of them, such as the judgment one will be very
     *           short, while others context can be infinitely long.
     * @property label The label that is associated with the field, such as
     *           Utterance, Morphemes, etc.
     * @property value This is what the user will enter when entering data into
     *           the data fields.
     * @property mask This allows users to mask fields for confidentiality.
     * @property shouldBeEncrypted This is whether the field is masked or not.
     * @property help This is a pop up that tells other users how to use the
     *           field the user has created.
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {

    },

    defaults : {
      label : "",
      value : "",
      mask : "",
      encrypted : "",
      shouldBeEncrypted : "",
      help : "Put your team's data entry conventions here (if any)..."
    },

    // Internal models: used by the parse function
    internalModels : {
      // There are no nested models
    },


    /**
     * Called before set and save, checks the attributes that the
     * user is attempting to set or save. If the user is trying to
     * set a mask on an encrypted datum field that should be encrypted, the only time they can do this is if the data is
     * in tempEncryptedVisible, with decryptedMode on.
     *
     * @param attributes
     */
    validate: function(attributes) {

//      if(attributes.mask){
//        if(attributes.shouldBeEncrypted != "checked" ){
//          //user can modify the mask, no problem.
//        }else if(attributes.encrypted != "checked" ){
//          //user can modify the mask, no problem.
//        }else if( attributes.encrypted == "checked" &&
////            attributes.tempEncryptedVisible == "checked"  &&
//            attributes.shouldBeEncrypted == "checked" &&
//              window.app.get("corpus").get("confidential").decryptedMode ){
//          //user can modify the mask, no problem.
//        }else if( attributes.mask != this.get("mask") ){
//          return "The datum is presently encrypted, the mask cannot be set by anything other than the model itself.";
//        }
//      }
//      if( attributes.value ){
//
//        if(this.get("value") && this.get("value").indexOf("confidential") == 0){
//          return "Cannot modify the value of a confidential datum field directly";
//        }
//
//        if(attributes.shouldBeEncrypted != "checked" ){
//          //user can modify the value, no problem.
//        }else if(attributes.encrypted != "checked" ){
//          //user can modify the value, no problem.
//        }else if( attributes.encrypted == "checked" &&
////            attributes.tempEncryptedVisible == "checked"  &&
//            attributes.shouldBeEncrypted == "checked" &&
//              window.app.get("corpus").get("confidential").decryptedMode ){
//          //the user/app can modify the value, no problem.
//        }else if( attributes.value != this.get("value") ){
//          return "The value cannot be set by anything other than the model itself, from a mask.";
//        }
//      }
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
     * @returns
     */
    set: function(key, value, options) {
      var attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key) || key == null) {
        attributes = key;
        options = value;
      } else {
        attributes = {};
        attributes[key] = value;
      }

      options = options || {};
      // do any other custom property changes here

      /*
       * Copy the mask, value and shouldBeEncrypted and encrypted from the object if it is not being set.
       */
      if(attributes.mask == undefined && this.get("mask")){
        attributes.mask = this.get("mask");
      }
      if(attributes.value == undefined && this.get("value")){
        attributes.value = this.get("value");
      }
      if(attributes.shouldBeEncrypted == undefined && this.get("shouldBeEncrypted")){
        attributes.shouldBeEncrypted = this.get("shouldBeEncrypted");
      }
      if(attributes.encrypted == undefined && this.get("encrypted")){
        attributes.encrypted = this.get("encrypted");
      }

      if( (attributes.mask && attributes.mask != "") ){

        if( attributes.shouldBeEncrypted != "checked" ){
          //Don't do anything special, this field doesnt get encrypted when the data is confidential
          attributes.value = attributes.mask;
        }else if( attributes.encrypted != "checked" ){
          //Don't do anything special, this datum isn't confidential
          attributes.value = attributes.mask;


        /*
         * A, B, C, D: If we are supposed to be encrypted, and we are encrypted, but we want to let the user see the data to change it.
         *
         */
        }else if( window.app.get("corpus").get("confidential").decryptedMode ){

          /*
           * A: If it wasn't encrypted, encrypt the value, and leave the mask as the original value for now,
           * can happen when the user clicks on the lock button for the first time.
           */
          if( attributes.mask.indexOf("confidential:") != 0 && window.appView ){
//          attributes.mask = attributes.mask;//leave mask open
            //save the mask encrpyted as the new value, this is triggered when the user modifies the data
            attributes.value = window.app.get("corpus").get("confidential").encrypt(attributes.mask);
          /*
           * B: A strange case which is used by the Datum Save function, to trigger the mask into the xxx version of the current value that it will be saved in the data base with xxx.
           */
          }else if( attributes.mask.indexOf("confidential:") == 0 && window.appView ){
            attributes.mask = this.mask(window.app.get("corpus").get("confidential").decrypt(this.get("value")));
            attributes.value = this.get("value"); //don't let the user modify the value.
          }

          /*
           * C & D: this should never be called since the value is supposed to come from the mask only.
           */

          /*
           * C: If the value wasn't encrypted, encrypt the value, and leave the mask as the original value since we are in decryptedMode
           */
          if( attributes.value && attributes.value.indexOf("confidential") != 0 && window.appView ){
//          attributes.mask = attributes.mask;//leave mask open
            attributes.value = window.app.get("corpus").get("confidential").encrypt(attributes.mask);
          /*
           * D: If the value was encrypted, there is some sort of bug, leave the value as it was, decrypt it and put it in to the mask since we are in decryptedMode
           */
          }else if( attributes.value && attributes.value.indexOf("confidential") == 0 && window.appView ){
            // If it was encrypted, turn the mask into the decrypted version of the current value so the user can see it.
            //this might get called at the same time as the first mask if above
            attributes.mask = window.app.get("corpus").get("confidential").decrypt(this.get("value"));
            attributes.value = this.get("value"); //don't let the user modify the value.
          }

          /*
           * E, F, G, H: If we are supposed to be encrypted and we are encrypted, but we are not in decrypted mode.
           */
        }else {

          //Don't let the user take off encryption if they are not in decryptedMode
          if( this.get("encrypted") == "checked" ){
            if( true && attributes.encrypted != "checked" && !window.app.get("corpus").get("confidential").decryptedMode ){
              attributes.encrypted = "checked";
            }
          }

          /*
           * E: A strange case which is used by the Datum Save function, to trigger the mask into the xxx version of the current value that it will be saved in the data base with xxx.
           *  (Same as B above)
           */
          if( attributes.mask && attributes.mask.indexOf("confidential") == 0 && window.appView ){
            attributes.mask = this.mask(window.app.get("corpus").get("confidential").decrypt(this.get("value")));
            attributes.value = this.get("value"); //don't let the user modify the value.
          /*
           * F: If the value is encrypted, then the mask is probably set, don't let the user change anything since they shouldn't be able to see the data anyway.s
           */
          }else{
            //Don't let user change value of confidential or mask: see validate function
            attributes.mask = this.get("mask");
            attributes.value = this.get("value");
          }

          /*
           * G: If the data is not encrypted, encrypt it and mask it in the mask. This might be called the first time a user clicks on the lock to first encrypts the value.
           * (Similar to C above, except that we mask the mask)
           */
          if( attributes.value && attributes.value.indexOf("confidential") != 0 && window.appView ){
            attributes.mask = this.mask(this.get("value"));//use value to make mask
            attributes.value = window.app.get("corpus").get("confidential").encrypt(this.get("value"));
          /*
           * H: If the value is encrypted, then the mask is probably set, don't let the user change anything since they shouldn't be able to see the data anyway.s
           */
          }else{
            //Don't let user change value of confidential or mask: see validate function
            attributes.mask = this.get("mask");
            attributes.value = this.get("value");
          }
        }
      }else{
//        alert("The datum field has no mask, there is a bug somewhere.");
//        attributes.value ="";
//        attributes.mask = "";
      }
      return Backbone.Model.prototype.set.call( this, attributes, options );
    },
    mask : function(stringToMask){
      return stringToMask.replace(/[A-Za-z]/g, "x");
    },
    saveAndInterConnectInApp : function(callback){

      if(typeof callback == "function"){
        callback();
      }
    },
    originalParse : Backbone.Model.prototype.parse,
    parse : function(originalModel){
      originalModel.label = originalModel.label || originalModel.id;
      return this.originalParse(originalModel);
    }
  });

  return DatumField;
});
