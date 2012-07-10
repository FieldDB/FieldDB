define([
    "backbone",
    "comment/Comments",
    "datum/DatumField",
    "datum/DatumFields",
    "user/Consultant",
    "user/Team",
    "user/User",
], function(
    Backbone,
    Comments,
    DatumField,
    DatumFields,
    Consultant,
    Team,
    User
) {
  var Session = Backbone.Model.extend(
  /** @lends Session.prototype */
  {
    /**
     * @class The Datum widget is the place where all linguistic data is
     *        entered; one at a time.
     * @property {Number} sessionID The session ID is an automatically generated
     *           number which will uniquely identify the session.
     * @property {String} user The user is the person inputting the data for
     *           that session.
     * @property {String} team The team is the team that the user belongs to.
     * @property {String} consultant The consultant is the native speaker of the
     *           language under investigation that has verified the data in the
     *           session.
     * @property {String} language The language is the language under
     *           investigation in the particular session.
     * @property {String} languageFamily The language family is an attribute
     *           which users can use to group languages.
     * @property {String} dialect The dialect specifies the dialect of the
     *           language under investigation.
     * @property {String} date The date is the date that the data was elicited.
     * @property {String} goal The goal is the particular linguistic goal that
     *           the researcher was pursuing during that session.
     * 
     *  new DatumField({
            label : "user",
            encrypted: "",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "consultants",
            encrypted: "",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "language",
            encrypted: "",
            userchooseable: "disabled",
            help: "This is the langauge (or language family) if you would like to use it."
          }),
          new DatumField({
            label : "dialect",
            encrypted: "",
            userchooseable: "disabled",
            help: "You can use this field to be as precise as you would like about the dialect of this session."
          }),
          new DatumField({
            label : "dateElicited",
            encrypted: "",
            userchooseable: "disabled",
            help: "This is the date in which the session took place."
          }),
          new DatumField({
            label : "dateSEntered",
            encrypted: "",
            userchooseable: "disabled",
            help: "This is the date in which the session was entered."
          }),
          new DatumField({
            label : "goal",
            encrypted: "",
            userchooseable: "disabled",
            help: "This describes the goals of the session."
          }),  
     * 
     * 
     * 
     * @description The initialize function brings up a page in which the user
     *              can fill out the details corresponding to the session. These
     *              details will be linked to each datum submitted in the
     *              session.
     * @extends Backbone.Model
     * @constructs
     */
    initialize: function() {
     
    //if the corpusname changes, change the pouch as well so that this object goes with its corpus's local pouchdb
//      this.bind("change:corpusname", function() {
//        this.pouch = Backbone.sync
//        .pouch(Utils.androidApp() ? Utils.touchUrl
//            + this.get("corpusname") : Utils.pouchUrl
//            + this.get("corpusname"));
//      }, this);
//      
//      try {
//        if (this.get("corpusname") == undefined) {
//          this.set("corpusname", app.get("corpus").get("corpusname"));
//        }
//        this.pouch = Backbone.sync
//        .pouch(Utils.androidApp() ? Utils.touchUrl
//            + this.get("corpusname") : Utils.pouchUrl
//            + this.get("corpusname"));
//      } catch(e) {
//        Utils.debug("Corpusname was undefined on this corpus, the session will not have a valid corpusname until it is set.");
//      }
    },
    
    // Internal models: used by the parse function
    model : {
      sessionFields : DatumFields,
      comments : Comments
    },
    
    changeCorpus : function(corpusname, callback) {
      if(this.pouch == undefined){
        this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl + corpusname : Utils.pouchUrl + corpusname);
      }
      if(typeof callback == "function"){
        callback();
      }
    },
    
    /**
     * Validation functions will verify that the session ID is unique and
     * that the consultant,users, and teams are all correspond to people in
     * the system.
     * 
     * @param {Object}
     *          attributes The set of attributes to validate.
     * 
     * @returns {String} The validation error, if there is one. Otherwise,
     *          doesn't return anything.
     */
    validate: function(attributes) {
      // TODO Validation on the attributes. Returning a String counts as an error.
      // We do need to validate some of these attributes, but not sure how they would work. I think they need for loops.
      
        //for (user not in users) {
      //    return "user must be in the system.";
      // }
       //for (team not in teams) {
      //    return "team must be in the system.";
      // }
       //if (consultant not in consultants ) {
      //    return "consultant must be in the system.";
      // }
    }
  });
  return Session;
});