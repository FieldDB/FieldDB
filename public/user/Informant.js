define( [ 
    "use!backbone", 
    "user/User" 
], function(Backbone,
    User) {
  var Informant = User.extend(

  /** @lends Informant.prototype */
  {
    /**
     * @class An informant is a type of user. It has the same information as a user plus extra,
     * but we want some info (e.g. first & last name, date of birth) to be kept confidential. Informant's gravatar should 
     * be locked to default unless he/she wants to be public. 
     * It also has permissions about the level of access to the data (read only, add/edit). 
     * 
     *  
     * @property {String} informantcode This is to keep the confidentiality of the informant (like a participant code in a survey). 
     * @property {String} birthDate This is informant's date of birth, to be kept confidential
     * @property {String} language This is informant's language 
     * @property {String} dialect This is informant's dialect 
     * 
     * @description The initialize function probably checks to see if the user is existing and create a new account if it is new. 
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */

    initialize : function(attributes) {
      Informant.__super__.initialize.call(this, attributes);

      this.set("informantcode" , "");
      this.set("birthDate", "");
      this.set("language", "");
      this.set("dialect", "");
    }
  });

  return Informant;
}); 



