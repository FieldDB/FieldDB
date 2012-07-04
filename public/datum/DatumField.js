define([
    "use!backbone"
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
      size : "",
      label : "",
      value : "",
      mask : "",
      encrypted : false,
      help : "Example from DataOne: Format conventions: use uppercase ,Codes for missing values: unknown"
    },
    
    model : {
      // There are no nested models
    },
    
    parse : function(response) {
      if (response.ok === undefined) {
        for (var key in this.model) {
          var embeddedClass = this.model[key];
          var embeddedData = response[key];
          response[key] = new embeddedClass(embeddedData, {parse:true});
        }
      }
      
      return response;
    },
   
    // in your Model validate function
    validate: function(attrs) {
      if (!attrs.mask) {
        attrs.mask = "hi empty mask";
      }
    }
  });

  return DatumField;
});
