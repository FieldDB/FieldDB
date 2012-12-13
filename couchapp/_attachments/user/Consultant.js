define( [ 
    "backbone", 
    "user/UserMask" 
], function(
    Backbone,
    UserMask
) {
  var Consultant = UserMask.extend(
  /** @lends Consultant.prototype */
  {
    /**
     * @class A consultant is a type of user. It has the same information as a user plus extra,
     * but we want some info (e.g. first & last name, date of birth) to be kept confidential. Consultant's gravatar should 
     * be locked to default unless he/she wants to be public. 
     * It also has permissions about the level of access to the data (read only, add/edit). 
     * 
     *  
     * @property {String} consultantcode This is to keep the confidentiality of the consultant (like a participant code in a survey). 
     * @property {String} birthDate This is consultant's date of birth, to be kept confidential
     * @property {String} language This is consultant's language 
     * @property {String} dialect This is consultant's dialect 
     * 
     * @description The initialize function probably checks to see if the user is existing and create a new account if it is new. 
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */
    initialize : function(attributes) {
      Consultant.__super__.initialize.call(this, attributes);

      this.set("consultantcode" , "");
//      this.set("birthDate", "");
      this.set("language", "");
      this.set("dialect", "");
    },
    
    model : {
      // There are no nested models
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return Consultant;
}); 



