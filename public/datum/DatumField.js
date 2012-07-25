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
     * @property encrypted This is whether the field is masked or not.
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
      encrypted : false,
      help : "Example from DataOne: Format conventions: use uppercase ,Codes for missing values: unknown"
    },
    
    // Internal models: used by the parse function
    model : {
      // There are no nested models
    },
   
    /**
     * Called before set and save, checks the attributes that the user is
     * attempting to set or save, In the case of the datumfield, if the datum
     * field is not encrypted, then the mask and value are essentially the same.
     * If however the datum is supposed to be encrypted, the value needs to
     * start with confidential, and the mask should be xxxx representign
     * words/morphemes which are allowed to be shown.
     * 
     * @param attributes
     */
    validate: function(attributes) {
//      if(attributes.encrypted == ""){
////        this.set("mask", attributes.value);
//        attributes.mask = attributes.value;
//      }else{
////        this.set("mask","xxx xxx xxx");
//        attributes.mask = "xxx xxx xxx";
//        if(attributes.value.indexOf("confidential") != 0){
////          this.set("value", window.app.get("corpus").get("confidential").encrypt(attributes.value));
//          attributes.value = window.app.get("corpus").get("confidential").encrypt(attributes.value);
//        }
//      }
      
    },
    //http://stackoverflow.com/questions/11315844/what-is-the-correct-way-in-backbone-js-to-listen-and-modify-a-model-property
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
      if ( options.settingsversion ) {
      }else{
        // do any other custom property changes here
        if( this.get("encrypted") == ""){ //TODO this should be an attribute of the datum?
          attributes["mask"] = attributes["value"] || this.get("value");
        }else{
          attributes["mask"] = "xxx xxx xxx";
          
          if( attributes["value"].indexOf("confidential") != 0 && window.appView){
            attributes["value"] = window.app.get("corpus").get("confidential").encrypt(attributes["value"]);
          }
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
