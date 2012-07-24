define([
    "backbone",
    "activity/Activity",
    "comment/Comment",
    "comment/Comments",
    "datum/DatumField",
    "datum/DatumFields",
    "user/Consultant",
    "user/Team",
    "user/User",
], function(
    Backbone,
    Activity,
    Comment,
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
      
      // If there are no comments, give it a new one
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      
    },
    
    // Internal models: used by the parse function
    model : {
      sessionFields : DatumFields,
      comments : Comments
    },
    
    changeCorpus : function(corpusname, callback) {
      if(!corpusname){
        corpusname = this.get("corpusname");
      }
      if(this.pouch == undefined){
        this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl + corpusname : Utils.pouchUrl + corpusname);
      }
      if(typeof callback == "function"){
        callback();
      }
    },
    /**
     * Accepts two functions to call back when save is successful or
     * fails. If the fail callback is not overridden it will alert
     * failure to the user.
     * 
     * - Adds the session to the corpus if it is in the right corpus, and wasnt already there
     * - Adds the session to the user if it wasn't already there
     * - Adds an activity to the logged in user with diff in what the user changed. 
     * 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      Utils.debug("Saving the Session");
      var self = this;
      var newModel = true;
      if(this.id){
        newModel = false;
      }
      //protect against users moving sessions from one corpus to another on purpose or accidentially
      if(window.app.get("corpus").get("corpusname") != this.get("corpusname")){
        if(typeof failurecallback == "function"){
          failurecallback();
        }else{
          alert('Session save error. I cant save this session in this corpus, it belongs to another corpus. ' );
        }
        return;
      }
      var oldrev = this.get("_rev");
      this.changeCorpus(null,function(){
        self.save(null, {
          success : function(model, response) {
            Utils.debug('Session save success');
            var goal = model.get("sessionFields").where({label: "goal"})[0].get("value");
            var differences = "<a class='activity-diff' href='#diff/oldrev/"+oldrev+"/newrev/"+response._rev+"'>"+goal+"</a>";
            //TODO add privacy for session goals in corpus
//            if(window.app.get("corpus").get("keepSessionDetailsPrivate")){
//              goal = "";
//              differences = "";
//            }
            if(window.appView){
              window.appView.toastUser("Sucessfully saved session: "+ goal,"alert-success","Saved!");
              window.appView.addSavedDoc(model.id);
            }
            var verb = "updated";
            if(newModel){
              verb = "added";
            }
            window.app.get("authentication").get("userPrivate").get("activities").unshift(
                new Activity({
                  verb : verb,
                  directobject : "<a href='#session/"+model.id+"'>session</a> ",
                  indirectobject : "in "+window.app.get("corpus").get("title"),
                  context : differences+" via Offline App.",
                  user: window.app.get("authentication").get("userPublic")
                }));
            
            //make sure the session is in this corpus, if it is the same corpusname
            if(window.app.get("corpus").get("sessions").getByCid(model.cid) != undefined && window.app.get("corpus").get("corpusname") == model.get("corpusname")){
              window.app.get("corpus").get("sessions").unshift(model);
              window.appView.addUnsavedDoc(window.app.get("corpus").id);
            }
            
            //make sure the session is in the history of the user
            if(window.app.get("authentication").get("userPrivate").get("sessionHistory").indexOf(model.id) == -1){
              window.app.get("authentication").get("userPrivate").get("sessionHistory").unshift(model.id);
            }
            window.app.get("authentication").saveAndInterConnectInApp();

            if(typeof successcallback == "function"){
              successcallback();
            }
          },
          error : function(e) {
            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
              alert('Session save error' + e);
            }
          }
        });
      });
    },
    /**
     * Accepts two functions success will be called if sucessfull,
     * otherwise it will attempt to render the current session views. If
     * the session isn't in the current corpus it will call the fail
     * callback or it will alert a bug to the user. Override the fail
     * callback if you don't want the alert.
     * 
     * @param successcallback
     * @param failurecallback
     */
    setAsCurrentSession : function(successcallback, failurecallback){
      if( window.app.get("corpus").get("corpusname") != this.get("corpusname") ){
        if (typeof failurecallback == "function") {
          failurecallback();
        }else{
          alert("This is a bug, cannot load the session you asked for, it is not in this corpus.");
        }
        return;
      }else{
        if (window.app.get("currentSession").id != this.id ) {
          window.app.set("currentSession", this);
        }
        window.app.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = this.id;
        window.app.get("authentication").saveAndInterConnectInApp();

        if (typeof successcallback == "function") {
          successcallback();
        }else{
          try{
            window.appView.setUpAndAssociateViewsAndModelsWithCurrentSession(function() {
//              window.appView.renderEditableSessionViews();
//              window.appView.renderReadonlySessionViews();
            });
          }catch(e){
            alert("This is probably a bug. There was a problem rendering the current session's views after resetting the current session.");
          }
        }
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