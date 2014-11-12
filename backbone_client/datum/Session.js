define([
    "backbone",
    "comment/Comment",
    "comment/Comments",
    "datum/DatumField",
    "datum/DatumFields",
    "user/Consultant",
    "user/Team",
    "user/User",
], function(
    Backbone,
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
     * @class The Session widget is the place where information which is generally
     * shared by many datum (due to being part of an elicitiation session)
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
            shouldBeEncrypted: "",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "consultants",
            shouldBeEncrypted: "",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "language",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "This is the langauge (or language family) if you would like to use it."
          }),
          new DatumField({
            label : "dialect",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "You can use this field to be as precise as you would like about the dialect of this session."
          }),
          new DatumField({
            label : "dateElicited",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "This is the date in which the session took place."
          }),
          new DatumField({
            label : "dateSEntered",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "This is the date in which the session was entered."
          }),
          new DatumField({
            label : "goal",
            shouldBeEncrypted: "",
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
      if (OPrime.debugMode) OPrime.debug("SESSION init");

      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }

      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      // If there are no comments, give it a new one
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      if(!this.get("sessionFields") || this.get("sessionFields").length == 0){
        if(window.app && window.app.get("corpus") && window.app.get("corpus").get("sessionFields")){
          this.set("sessionFields", window.app.get("corpus").get("sessionFields").clone());
        }else{
          if (OPrime.debugMode) OPrime.debug("Not creating sessions fields");
        }
      }
      this.get("sessionFields").where({label: "user"})[0].set("mask", app.get("authentication").get("userPrivate").get("username") );
      this.get("sessionFields").where({label: "consultants"})[0].set("mask", "XY");
      this.get("sessionFields").where({label: "goal"})[0].set("mask", "Change this session goal to the describe your first elicitiation session.");
      this.get("sessionFields").where({label: "dateSEntered"})[0].set("mask", new Date());
      this.get("sessionFields").where({label: "dateElicited"})[0].set("mask", "Change this to a time period or date for example: Spring 2013 or Day 2 Ling 489 or Nov 23 2012.");

    },
    setConsultants: function(consultants){
      if(consultants == undefined || consultants == null){
        return;
      }
      this.get("sessionFields").where({label: "consultants"})[0].set("mask", consultants.trim());
    },
    getGoal : function(){
      var goal = "";
      try {
        goal = this.get("sessionFields").where({
          label : "goal"
        })[0].get("mask");
      } catch (e) {
        OPrime.debug("This session doesnt seem to have a goal.");
      }
      return goal;
    },
    /**
     * backbone-couchdb adaptor set up
     */

    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/sessions",

    // Internal models: used by the parse function
    internalModels : {
      sessionFields : DatumFields,
      comments : Comments
    },
    originalParse : Backbone.Model.prototype.parse,
    parse : function(originalModel){
      /* if this is just a couchdb save result, dont process it */
      if (originalModel.ok) {
        return this.originalParse.apply(this, [originalModel]);
      }
      OPrime.debug("Edit this function to update session to the latest schema.");

      if(window.app.get("corpus")){
        /* Add any new corpus fields to this session so they can be edited */
        var originalFieldLabels = _.pluck(originalModel.sessionFields, "label");
        window.corpusfieldsforSessionParse = window.corpusfieldsforSessionParse || window.app.get("corpus").get("sessionFields").toJSON()
        var corpusFields = window.corpusfieldsforSessionParse;
        if(corpusFields.length > originalFieldLabels.length){
          for(var field in corpusFields){
            if(originalFieldLabels.indexOf(corpusFields[field].label) === -1){
              var corpusFieldClone = JSON.parse(JSON.stringify(corpusFields[field]));
              OPrime.debug("Adding field to this session: " + corpusFieldClone.label);
              corpusFieldClone.mask = "";
              corpusFieldClone.value = "";
              delete corpusFieldClone.user;
              delete corpusFieldClone.users;
              originalModel.sessionFields.push(corpusFieldClone);
            }
          }
        }
      }

      return this.originalParse.apply(this, [originalModel]);
    },


  //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function(commentstring) {
      var m = new Comment({
        "text" : commentstring,
     });

      this.get("comments").add(m);
      window.appView.addUnsavedDoc(this.id);

      var goal = this.get("sessionFields").where({label: "goal"})[0].get("mask");

      window.app.addActivity(
          {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <a href='#data/"+this.id+"'><i class='icon-calendar'></i> "+goal+"</a>",
            teamOrPersonal : "team",
            context : " via Offline App."
          });

      window.app.addActivity(
          {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <a href='#data/"+this.id+"'><i class='icon-calendar'></i> "+goal+"</a>",
            teamOrPersonal : "personal",
            context : " via Offline App."
          });
    },

    /**
     * Make the  model marked as Deleted, mapreduce function will
     * ignore the deleted models so that it does not show in the app,
     * but deleted model remains in the database until the admin empties
     * the trash.
     *
     * Also remove it from the view so the user cant see it.
     *
     */
    putInTrash : function() {
      this.set("trashed", "deleted" + Date.now());
      var whichSessionToUse = 0;
      if (window.app.get("corpus").sessions.models[whichSessionToUse].id == this.id) {
        whichSessionToUse = 1;
      }
      var self = this;
      this.saveAndInterConnectInApp(function(){
        window.app.addActivity({
          verb: "deleted",
          verbicon: "icon-trash",
          directobjecticon: "icon-calendar",
          directobject: "<a href='#session/" + self.id + "'>a session</a> ",
          indirectobject: "in <a href='#corpus/" + window.app.get("corpus").id + "'>" + window.app.get("corpus").get('title') + "</a>",
          teamOrPersonal: "team",
          context: " via Offline App."
        });

        window.app.addActivity({
          verb: "deleted",
          verbicon: "icon-trash",
          directobjecticon: "icon-calendar",
          directobject: "<a href='#session/" + self.id + "'>a session</a> ",
          indirectobject: "in <a href='#corpus/" + window.app.get("corpus").id + "'>" + window.app.get("corpus").get('title') + "</a>",
          teamOrPersonal: "personal",
          context: " via Offline App."
        });


        window.app.get("corpus").sessions.models[whichSessionToUse]
        .setAsCurrentSession(function() {
          if (window.appView) {
            /* TODO test this */
            window.app.get("corpus").sessions = null;
            window.appView.currentCorpusReadView.model
            .makeSureCorpusHasASession(function() {
              window.appView.currentCorpusEditView
              .changeViewsOfInternalModels();
//              window.appView.currentCorpusReadView.render();
              window.appView.currentCorpusReadView
              .changeViewsOfInternalModels();
//              window.appView.currentCorpusReadView.render();
              window.app.router.navigate("render/true", {trigger: true});
            });
          }
        });
      });
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
      if (OPrime.debugMode) OPrime.debug("Saving the Session");
      var self = this;
      var newModel = true;
      if(this.id){
        newModel = false;
      }else{
        this.set("dateCreated",JSON.stringify(new Date()));
      }
      //protect against users moving sessions from one corpus to another on purpose or accidentially
      if(window.app.get("corpus").get("pouchname") != this.get("pouchname")){
        if(typeof failurecallback == "function"){
          failurecallback();
        }else{
          alert('Session save error. I cant save this session in this corpus, it belongs to another corpus. ' );
        }
        return;
      }
      var oldrev = this.get("_rev");
      this.set("dateModified", JSON.stringify(new Date()));
      this.set("timestamp", Date.now());
        self.save(null, {
          success : function(model, response) {
            if (OPrime.debugMode) OPrime.debug('Session save success');
            var goal = model.get("sessionFields").where({label: "goal"})[0].get("mask");
            var differences = "#diff/oldrev/"+oldrev+"/newrev/"+response._rev;
            //TODO add privacy for session goals in corpus
//            if(window.app.get("corpus").get("keepSessionDetailsPrivate")){
//              goal = "";
//              differences = "";
//            }
            if(window.appView){
              window.appView.toastUser("Sucessfully saved session: "+ goal,"alert-success","Saved!");
              window.appView.addSavedDoc(model.id);
            }
            var verb = "modified";
            verbicon = "icon-pencil";
            if(newModel){
              verb = "added";
              verbicon = "icon-plus";
            }
            window.app.addActivity(
                {
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon : verbicon,
                  directobjecticon : "icon-calendar",
                  directobject : "<a href='#session/"+model.id+"'>"+goal+"</a> ",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "team",
                  context : " via Offline App."
                });

            window.app.addActivity(
                {
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon : verbicon,
                  directobjecticon : "icon-calendar",
                  directobject : "<a href='#session/"+model.id+"'>"+goal+"</a> ",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "personal",
                  context : " via Offline App."
                });

            /*
             * make sure the session is visible in this corpus
             */
            var previousversionincorpus = window.app.get("corpus").sessions.get(model.id);
            if( previousversionincorpus == undefined ){
              window.app.get("corpus").sessions.unshift(model);
            }else{
                window.app.get("corpus").sessions.remove(previousversionincorpus);
                window.app.get("corpus").sessions.unshift(model);
            }
              window.app.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = model.id;
            //make sure the session is in the history of the user
            if(window.app.get("authentication").get("userPrivate").get("sessionHistory").indexOf(model.id) == -1){
              window.app.get("authentication").get("userPrivate").get("sessionHistory").unshift(model.id);
            }
//            window.appView.addUnsavedDoc(window.app.get("authentication").get("userPrivate").id);
            window.app.get("authentication").saveAndInterConnectInApp();

            if(typeof successcallback == "function"){
              successcallback();
            }
          },
          error : function(e, f, g) {
            if (OPrime.debugMode) OPrime.debug("Session save error", e, f, g);
            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
              alert('Session save error: ' + f.reason);
            }
          }
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
      if( window.app.get("corpus").get("pouchname") != this.get("pouchname") ){
        if (typeof failurecallback == "function") {
          failurecallback();
        }else{
          alert("This is a bug, cannot load the session you asked for, it is not in this corpus.");
        }
        return;
      }

      if (window.app.get("currentSession").id != this.id ) {
        window.app.set("currentSession", this); //This results in a non-identical session in the currentsession with the one live in the corpus sessions collection.
//      window.app.set("currentSession", app.get("corpus").sessions.get(this.id)); //this is a bad idea too, use above instead
      }
      window.app.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = this.id;
      window.app.get("authentication").saveAndInterConnectInApp(); //saving users is cheep

      if(window.appView) {
        window.appView.setUpAndAssociateViewsAndModelsWithCurrentSession(function() {
          if (typeof successcallback == "function") {
            successcallback();
          }else{
            window.appView.currentSessionReadView.format = "leftSide";
            window.appView.currentSessionReadView.render();
            window.appView.toastUser("Sucessfully connected all views up to session: "+ this.id, "alert-success", "Connected!");
//          window.appView.renderEditableSessionViews("leftSide");
//          window.appView.renderReadonlySessionViews("leftSide");
          }
        });
      }else{
        if (typeof successcallback == "function") {
          successcallback();
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
