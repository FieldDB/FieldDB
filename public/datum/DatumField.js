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
      help : "Example from DataOne: Format conventions: use uppercase ,Codes for missing values: unknown"
    },
    
    // Internal models: used by the parse function
    model : {
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

      if(attributes.mask){
        if(attributes.shouldBeEncrypted != "checked" ){
          //user can modify the mask, no problem.
        }else if(attributes.encrypted != "checked" ){
          //user can modify the mask, no problem.
        }else if( attributes.encrypted == "checked" &&
//            attributes.tempEncryptedVisible == "checked"  &&
            attributes.shouldBeEncrypted == "checked" &&
              window.app.get("corpus").get("confidential").decryptedMode ){
          //user can modify the mask, no problem.
        }else if( attributes.mask != this.get("mask") ){
          return "The datum is presently encrypted, the mask cannot be set by anything other than the model itself.";
        }
      }
      if( attributes.value ){
        
        if(this.get("value").indexOf("confidential") == 0){
          return "Cannot modify the value of a confidential datum field directly";
        }
        
        if(attributes.shouldBeEncrypted != "checked" ){
          //user can modify the value, no problem.
        }else if(attributes.encrypted != "checked" ){
          //user can modify the value, no problem.
        }else if( attributes.encrypted == "checked" &&
//            attributes.tempEncryptedVisible == "checked"  &&
            attributes.shouldBeEncrypted == "checked" &&
              window.app.get("corpus").get("confidential").decryptedMode ){
          //the user/app can modify the value, no problem.
        }else if( attributes.value != this.get("value") ){
          return "The value cannot be set by anything other than the model itself, from a mask.";
        }
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
      //Don't let the user take off encryption if they are not in decryptedMode
      if( this.get("encrypted") == "checked" ){
        if( true && attributes.encrypted != "checked" && !window.app.get("corpus").get("confidential").decryptedMode ){
          attributes.encrypted = "checked";
        }
      }
      /*
       * trying to change the value triggers the temporary or permanent encryption/decryption process
       */
      if( (attributes.value && attributes.value != "") ){
        //User turns on the tempEncryptedVisible
        if( attributes.shouldBeEncrypted == "checked" ){
          if( true &&
//            attributes.tempEncryptedVisible == "checked"  &&
            attributes.encrypted  == "checked" &&
              window.app.get("corpus").get("confidential").decryptedMode ){
            // If it wasn't encrypted, encrypt the value, and leave the mask as the original value for now
            if( this.get("value").indexOf("confidential") != 0 && window.appView ){
              attributes.mask = this.get("value");
              attributes.value = window.app.get("corpus").get("confidential").encrypt(this.get("value"));
            }else if( attributes.value.indexOf("confidential") == 0 && window.appView ){
              // If it was encrypted, turn the mask into the decrypted version so the user can see it.
              attributes.mask = window.app.get("corpus").get("confidential").decrypt(this.get("value"));
            }
            
          }else if( attributes.encrypted == "checked" 
            && attributes.shouldBeEncrypted == "checked" ){
            
            if( this.get("value").indexOf("confidential") != 0 && window.appView ){
              attributes.value = window.app.get("corpus").get("confidential").encrypt(this.get("value"));
              attributes.mask = "xxx xxx xxx";//use value to make mask
            }else{
              //Don't let user change value of confidential or mask: see validate function
              attributes.mask = this.get("mask");
              attributes.value = this.get("mask");
            }
          }
        }else{
          attributes.value = this.get("mask");
        }
        
      }
      return Backbone.Model.prototype.set.call( this, attributes, options ); 
    },
    
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return DatumField;
});
