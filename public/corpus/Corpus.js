define([ 
    "backbone",
    "activity/Activity",
    "comment/Comment",
    "comment/Comments",
    "corpus/CorpusMask",
    "confidentiality_encryption/Confidential",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumState",
    "datum/DatumStates",
    "data_list/DataList",
    "data_list/DataLists",
    "user/Consultants",
    "lexicon/Lexicon",
    "permission/Permission",
    "permission/Permissions",
    "datum/Session",
    "datum/Sessions",
    "user/Team",
    "user/User",
    "user/Users",
    "user/UserMask",
    "glosser/Glosser",
    "libs/Utils"
], function(
    Backbone, 
    Activity,
    Comment, 
    Comments,
    CorpusMask,
    Confidential,
    DatumField,
    DatumFields, 
    DatumState,
    DatumStates,
    DataList,
    DataLists,
    Consultants,
    Lexicon,
    Permission,
    Permissions,
    Session,
    Sessions,
    Team,
    User,
    Users,
    UserMask
) {
  var Corpus = Backbone.Model.extend(
  /** @lends Corpus.prototype */
  {
    /**
     * @class A corpus is like a git repository, it has a remote, a title
     *        a description and perhaps a readme When the user hits sync
     *        their "branch" of the corpus will be pushed to the central
     *        remote, and we will show them a "diff" of what has
     *        changed.
     * 
     * The Corpus may or may not be a git repository, so this class is
     * to abstract the functions we would expect the corpus to have,
     * regardless of how it is really stored on the disk.
     * 
     * 
     * @property {String} title This is used to refer to the corpus, and
     *           what appears in the url on the main website eg
     *           http://fieldlinguist.com/LingLlama/SampleFieldLinguisticsCorpus
     * @property {String} description This is a short description that
     *           appears on the corpus details page
     * @property {String} remote The git url of the remote eg:
     *           git@fieldlinguist.com:LingLlama/SampleFieldLinguisticsCorpus.git
     *           
     * @property {Consultants} consultants Collection of consultants who contributed to the corpus
     * @property {DatumStates} datumstates Collection of datum states used to describe the state of datums in the corpus 
     * @property {DatumFields} datumfields Collection of datum fields used in the corpus
     * @property {Sessions} sessions Collection of sessions that belong to the corpus
     * @property {DataLists} datalists Collection of data lists created under the corpus
     * @property {Permissions} permissions Collection of permissions groups associated to the corpus 
     * 
     *           
     * @property {Glosser} glosser The glosser listens to
     *           orthography/utterence lines and attempts to guess the
     *           gloss.
     * @property {Lexicon} lexicon The lexicon is a list of morphemes,
     *           allomorphs and glosses which are used to index datum, and
     *           also to gloss datum.
     * 
     * @description The initialize function probably checks to see if
     *              the corpus is new or existing and brings it down to
     *              the user's client.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      Utils.debug("CORPUS INIT");
      if(!this.get("confidential")){
        this.set("confidential", new Confidential() )
      }
      
      if(!this.get("publicSelf")){
        this.set("publicSelf", new CorpusMask({
          "couchConnection" : this.get("couchConnection"),
          "pouchname" : this.get("pouchname")
        }));
      }
      if(!this.get("publicCorpus")){
        this.set("publicCorpus", "Private");
      }
      this.bind("change:publicCorpus",this.changeCorpusPublicPrivate,this);
      
      if(typeof(this.get("datumStates")) == "function"){
        this.set("datumStates", new DatumStates([ 
          new DatumState({
            state : "Checked",
            color : "success",
            selected: "selected"
          }),
          new DatumState({
            state : "To be checked",
            color : "warning"
          }),
          , new DatumState({
            state : "Deleted",
            color : "important",
            showInSearchResults:  ""
          }),
        ]));
      }//end if to set datumStates
      
      if(typeof(this.get("datumFields")) == "function"){
        this.set("datumFields", new DatumFields([ 
          new DatumField({
            label : "judgement",
            size : "3",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "Use this field to establish your team's gramaticality/acceptablity judgements (*,#,? etc). Leaving it blank can mean grammatical/acceptable, or you can add a new symbol to mean grammatical/acceptable."
          }),
          new DatumField({
            label : "utterance",
            shouldBeEncrypted: "checked",
            userchooseable: "disabled",
            help: "Use this as Line 1 in your examples for handouts (ie, either Orthography, or phonemic/phonetic representation)"
          }),
          new DatumField({
            label : "morphemes",
            shouldBeEncrypted: "checked",
            userchooseable: "disabled",
            help: "This line is used to determine the morpheme segmentation to generate glosses, it also optionally can show up in your LaTeXed examples if you choose to show morpheme segmentation in addtion ot line 1, gloss and translation."
          }),
          new DatumField({
            label : "gloss",
            shouldBeEncrypted: "checked",
            userchooseable: "disabled",
            help: "This line appears in the gloss line of your LaTeXed examples, we reccomend Leipzig conventions (. for fusional morphemes, - for morpehem boundaries etc) The system uses this line to partially help you in glossing. "
          }),
          new DatumField({
            label : "translation",
            shouldBeEncrypted: "checked",
            userchooseable: "disabled",
            help: "Use this as your primary translation. It does not need to be English, simply a language your team is comfortable with. If your consultant often gives you multiple languages for translation you can also add addtional translations in the customized fields. For example, your Quechua informants use Spanish for translations, then you can make all Translations in Spanish, and add an additional field for English if you want to generate a handout containing the datum. "
          })
        ]));
      }//end if to set datumFields
      
      if(typeof(this.get("sessionFields")) == "function"){
        this.set("sessionFields", new DatumFields([ 
           new DatumField({
             label : "goal",
             shouldBeEncrypted: "",
             userchooseable: "disabled",
             help: "This describes the goals of the session."
           }),  
          new DatumField({
            label : "consultants",
            shouldBeEncrypted: "",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "dialect",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "You can use this field to be as precise as you would like about the dialect of this session."
          }),
          new DatumField({
            label : "language",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "This is the langauge (or language family) if you would like to use it."
          }),
          new DatumField({
            label : "dateElicited",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "This is the date in which the session took place."
          }),
          new DatumField({
            label : "user",
            shouldBeEncrypted: "",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "dateSEntered",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "This is the date in which the session was entered."
          }),
        ]));
        
      }//end if to set sessionFields
      
      
      // If there are no comments, create models
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      
      if (!this.get("dataLists")) {
        this.set("dataLists", new DataLists());
      }
      
      if (!this.get("sessions")) {
        this.set("sessions", new Sessions());
      }
      //this.loadPermissions();
      
//      var couchConnection = this.get("couchConnection");
//      if(!couchConnection){
//        couchConnection = JSON.parse(localStorage.getItem("mostRecentCouchConnection"));
//        if(!localStorage.getItem("mostRecentCouchConnection")){
//          alert("Bug, need to take you back to the users page.");
//        }
//        this.set("couchConnection", couchConnection);
//      }
//      this.pouch = Backbone.sync
//      .pouch(Utils.androidApp() ? Utils.touchUrl
//        + couchConnection.pouchname : Utils.pouchUrl
//        + couchConnection.pouchname);
      
    },
    loadPermissions: function(){
      if (!this.get("team")){
        //If app is completed loaded use the user, otherwise put a blank user
        if(window.appView){
          this.set("team", window.app.get("authentication").get("userPublic"));
//          this.get("team").id = window.app.get("authentication").get("userPublic").id;
        }else{
//          this.set("team", new UserMask({pouchname: this.get("pouchname")}));
        }
      }
      this.permissions = new Permissions();
      var admins = new Users();
      if(this.get("team")){
        admins.models.push(this.get("team"));
      }
      this.permissions.add(new Permission({
        users: admins,
        role: "admin",
        pouchname: this.get("pouchname")
      }));
      
      this.permissions.add(new Permission({
        users: new Users(),
        role: "reader",
        pouchname: this.get("pouchname")
      }));
      this.permissions.add(new Permission({
        users: new Users(), //"fielddbpublicuser"
        role: "writer",
        pouchname: this.get("pouchname")
      }));
      //TODO load the permissions in from the server.
    },
    
    defaults : {
      title : "Untitled Corpus",
      titleAsUrl :"UntitledCorpus",
      description : "This is an untitled corpus, created by default. You should change its title and description to better describe whatever database/corpus you want to build.",
//      confidential :  Confidential,
      consultants : Consultants,
      datumStates : DatumStates,
      datumFields : DatumFields, 
      sessionFields : DatumFields,
      searchFields : DatumFields,
      couchConnection : JSON.parse(localStorage.getItem("mostRecentCouchConnection")) || Utils.defaultCouchConnection()
    },
    
    // Internal models: used by the parse function
    model : {
      confidential :  Confidential,
      consultants : Consultants,
      datumStates : DatumStates,
      datumFields : DatumFields, 
      sessionFields : DatumFields,
      searchFields : DatumFields,
      sessions : Sessions, 
      dataLists : DataLists, 
      publicSelf : CorpusMask,
      comments: Comments,
      team: UserMask
    },
    //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function(commentstring) {
      var m = new Comment({
        "text" : commentstring,
     });
      
      this.get("comments").add(m);
      window.appView.addUnsavedDoc(this.id);
      
      window.app.get("currentCorpusTeamActivityFeed").addActivity(
          new Activity({
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <i class='icon-cloud'></i><a href='#corpus/"+this.id+"'>this corpus</a>",
            teamOrPersonal : "team",
            context : " via Offline App."
          }));
      
      window.app.get("currentUserActivityFeed").addActivity(
          new Activity({
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <i class='icon-cloud'></i><a href='#corpus/"+this.id+"'>"+this.get('title')+"</a>",
            teamOrPersonal : "personal",
            context : " via Offline App."
          }));
    },
    newSession : function() {
      $("#new-session-modal").modal("show");
      //Save the current session just in case
      var self = this;
      window.app.get("currentSession").saveAndInterConnectInApp(function(){
        //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
        window.appView.sessionNewModalView.model = new Session({
          pouchname : self.get("pouchname"),
          sessionFields : window.app.get("currentSession").get("sessionFields").clone()
        });
        window.appView.sessionNewModalView.model.set("comments", new Comments());
        window.appView.sessionNewModalView.render();
      });
    },
    newCorpus : function(){
     
      $("#new-corpus-modal").modal("show");
      //Save the current session just in case
      this.saveAndInterConnectInApp();
      //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
      var attributes = JSON.parse(JSON.stringify(this.attributes));
      // Clear the current data list's backbone info and info which we shouldnt clone
      attributes._id = undefined;
      attributes._rev = undefined;
      /*
       * WARNING this might not be a good idea, if you find strange side
       * effects in corpora in the future, it might be due to this way
       * of creating (duplicating) a corpus. However with a corpus it is
       * a good idea to duplicate the permissions and settings so that
       * the user won't have to redo them.
       */
      attributes.title = this.get("title")+ " copy";
      attributes.titleAsUrl = this.get("titleAsUrl")+"Copy";
      attributes.description = "Copy of: "+this.get("description");
//      attributes.sessionFields = new DatumFields(attributes.sessionFields);
      attributes.pouchname = this.get("pouchname")+"copy";
      attributes.couchConnection.pouchname = this.get("pouchname")+"copy";
      attributes.dataLists = [];
      attributes.sessions = [];
      attributes.comments = [];
      attributes.publicSelfMode = {};
      attributes.team = window.app.get("authentication").get("userPublic").toJSON();
      //clear out search terms from the new corpus's datum fields
      for(var x in attributes.datumFields){
        attributes.datumFields[x].mask = "";
        attributes.datumFields[x].value = "";
      }
      //clear out search terms from the new corpus's session fields
      for(var x in attributes.sessionFields){
        attributes.sessionFields[x].mask = "";
        attributes.sessionFields[x].value = "";
      }
      window.appView.corpusNewModalView.model = new Corpus();
      //be sure internal models are parsed and built.
      window.appView.corpusNewModalView.model.set(window.appView.corpusNewModalView.model.parse(attributes));
      window.appView.corpusNewModalView.render();
    },

    
//    glosser: new Glosser(),//DONOT store in attributes when saving to pouch (too big)
    lexicon: new Lexicon(),//DONOT store in attributes when saving to pouch (too big)
    changePouch : function(couchConnection, callback) {
      if (couchConnection == null || couchConnection == undefined) {
        couchConnection = this.get("couchConnection");
      }
      if(!couchConnection){
        Utils.debug("Cant change corpus's couch connection");
        return;
      }
      if (this.pouch == undefined) {
        this.pouch = Backbone.sync
        .pouch(Utils.androidApp() ? Utils.touchUrl
            + couchConnection.pouchname : Utils.pouchUrl
            + couchConnection.pouchname);
      }

      Utils.testPouchChromeVersions(couchConnection.pouchname);
      if (typeof callback == "function") {
        callback();
      }
    }, 
    /**
     * Accepts two functions to call back when save is successful or
     * fails. If the fail callback is not overridden it will alert
     * failure to the user.
     * 
     * - Adds the corpus to the corpus if it is in the right corpus, and wasn't already there
     * - Adds the corpus to the user if it wasn't already there
     * - Adds an activity to the logged in user with diff in what the user changed. 
     * 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      Utils.debug("Saving the Corpus");
      var self = this;
      var newModel = false;
      if(!this.id){
        newModel = true;
        
        if(!this.get("pouchname")){
          this.set("pouchname", this.get("team").get("username")
              +"-"+this.get("title").replace(/[^a-zA-Z0-9-._~ ]/g,"") ) ;
        }
        if(!this.get("couchConnection")){
          this.get("couchConnection").pouchname = this.get("team").get("username")
          +"-"+this.get("title").replace(/[^a-zA-Z0-9-._~ ]/g,"") ;
        }
      }else{
        this.get("couchConnection").corpusid = this.id;
      }
      var oldrev = this.get("_rev");
      
      /*
       * For some reason the corpus is getting an extra state that no one defined in it. this gets rid of it when we save.
       */
      try{
        var ds = this.get("datumStates").models;
        for (var s in ds){
          if(ds[s].get("state") == undefined){
            this.get("datumStates").remove(ds[s]);
          }
        }
      }catch(e){
        Utils.debug("Removing empty states work around failed some thing was wrong.",e);
      }
      
      
      this.changePouch(null,function(){
        self.save(null, {
          success : function(model, response) {
            Utils.debug('Corpus save success');
            var title = model.get("title");
            var differences = "#diff/oldrev/"+oldrev+"/newrev/"+response._rev;
            //TODO add privacy for corpus in corpus
//            if(window.app.get("corpus").get("keepCorpusDetailsPrivate")){
//              title = "";
//              differences = "";
//            }
            //save the corpus mask too
            var publicSelfMode = model.get("publicSelf");
            if(publicSelfMode.changePouch){
              publicSelfMode.changePouch( model.get("couchConnection"), function(){
                publicSelfMode.saveAndInterConnectInApp();
              });
            }
            
            if(window.appView){
              window.appView.toastUser("Sucessfully saved corpus: "+ title,"alert-success","Saved!");
              window.appView.addSavedDoc(model.id);
            }
            var verb = "updated";
            verbicon = "icon-pencil";
            if(newModel){
              verb = "added";
              verbicon = "icon-plus";
            }
            var teamid = model.get("team").id; //Works if UserMask was saved
            if(!teamid){
              //TODO test this, this is to protect from the case wher the id of the team is not set yet.
//              window.app.get("authentication").get("userPublic").saveAndInterConnectInApp(function(){
//                window.app.get("corpus").set("team", window.app.get("authentication").get("userPublic"));
//                window.app.get("currentCorpusTeamActivityFeed").addActivity(
//                    new Activity({
//                      verb : verb,
//                      directobject : "<a href='#corpus/"+window.app.get("corpus").id+"'>corpus "+title+"</a> ",
//                      indirectobject : "owned by <a href='#user/"+window.app.get("corpus").get("team").id+"'>"+window.app.get("corpus").get("team").get("username")+"</a>",
//                      context : differences+" via Offline App."
//                    }));
//              });
              teamid = model.get("team")._id; //Works if UserMask came from a mongodb id
              if(!teamid){
                if(model.get("team").get("username") == window.app.get("authentication").get("userPrivate").get("username")){
                  teamid = window.app.get("authentication").get("userPrivate").id; //Assumes the user private and team are the same user...this is dangerous
                }
              }
              /**
               * The idea of the masks in the activity
               * is that the teams/users can make a
               * public activity feed, which they create
               * a special widget user for, and if the
               * widget user asks for activities, the
               * map reduce function returns only the
               * masks, whcih means that the original
               * activities are protected. so if the
               * activity is soemthing that you might
               * want to appear in a really public feed,
               * then add a mask to it, and it will
               * automatically appear. this can probably
               * be done for all activities later. Right
               * now its only in the syncing aspect so
               * at least we can test the map reduce
               * function.
               */
              window.app.get("currentUserActivityFeed").addActivity(
                  new Activity({
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "personal"
                  }));
              window.app.get("currentCorpusTeamActivityFeed").addActivity(
                  new Activity({
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>this team</a>",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>this team</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "team"
                  }));
            }else{
              window.app.get("currentUserActivityFeed").addActivity(
                  new Activity({
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "personal"
                  }));
              window.app.get("currentCorpusTeamActivityFeed").addActivity(
                  new Activity({
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>this team</a>",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>this team</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "team"
                  }));
            }
            model.get("couchConnection").corpusid = model.id;
            //make sure the corpus is in the history of the user
            var pouches = _.pluck(window.app.get("authentication").get("userPrivate").get("corpuses"), "pouchname");
            if(pouches.indexOf(model.get("couchConnection").pouchname) == -1){
              window.app.get("authentication").get("userPrivate").get("corpuses").unshift(model.get("couchConnection"));
            }
            /*
             * Save the default data list, in case it has changed without being saved in pouch. 
             */
            if(model.get("dataLists").length > 0){
              var defaultDatalist = model.get("dataLists").models[model.get("dataLists").length - 1];

              if(defaultDatalist.needsSave){
//                defaultDatalist.changePouch(null, function(){
//                  Utils.debug("Saving the default datalist because it was changed by adding datum, and it wasn't the current data list so it is was the 'active' defualt datalist.");
//                  defaultDatalist.save();
                //TODO uncomment this
//                });
              }
            }
            if(newModel){
              
              self.makeSureCorpusHasADataList(function(){
                self.makeSureCorpusHasASession(function(){
                  //save the internal models go to the user dashboard to to load the corpus into the dashboard
                  self.save(null, {
                    success : function(model, response) {
                      window.app.get("authentication").saveAndInterConnectInApp(function(){
                        window.location.replace("user.html#corpus/"+model.get("couchConnection").pouchname+"/"+model.id);
                      });
                    },error : function(e) {
                      alert('New Corpus save error' + e);
                    }
                  });

                  //end success to create new session
                },function(e){
                  alert("Failed to create a session. "+e);
                });//end failure to create new session
                //end success to create new data list
              },function(){
                alert("Failed to create a datalist. "+e);
              });//end failure to create new data list
              
             
            }else{
              //if an existing corpus
              window.app.get("authentication").saveAndInterConnectInApp();
              if(typeof successcallback == "function"){
                successcallback();
              }
            }
          },
          error : function(e) {
            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
              alert('Corpus save error' + e);
            }
          }
        });
      });
    },
    makeSureCorpusHasADataList : function(sucess, failure){
      if(this.get("dataLists").models.length > 0){
        if (typeof sucess == "function"){
          sucess();
          return;
        }
      }
      var self = this;
    //create the first datalist for this corpus.
      var dl = new DataList({
        pouchname : this.get("pouchname")}); //MUST be a new model, other wise it wont save in a new pouch.
      dl.set({
        "title" : "Default Datalist - Empty",
        "dateCreated" : (new Date()).toDateString(),
        "description" : "The app comes with a default datalist which is empty. " +
        "Once you have data in your corpus, you can create a datalist using Search. Imported data will also show up as a datalist. " +
        "Datalists can be used to create handouts, export to LaTeX, or share with collaborators.",
        "pouchname" : this.get("pouchname")
      });
      dl.set("dateCreated",JSON.stringify(new Date()));
      dl.set("dateModified", JSON.stringify(new Date()));
      dl.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl + this.get("pouchname") : Utils.pouchUrl + this.get("pouchname"));
      dl.save(null, {
        success : function(model, response) {
          window.app.get("authentication").get("userPrivate").get("dataLists").unshift(model.id);
          self.get("dataLists").unshift(model);
          
          if(typeof sucess == "function"){
            sucess();
          }else{
            Utils.debug('DataList save success' + model.id);
          }
        },
        error : function(e) {
          if(typeof failure == "function"){
            failure();
          }else{
            Utils.debug('DataList save error' + e);
          }
        }
      });
    },
    makeSureCorpusHasASession : function(suces, fail){
      if(this.get("sessions").models.length > 0){
        if (typeof suces == "function"){
          suces();
          return;
        }
      }
      var self = this;
      var s = new Session({
        pouchname : this.get("pouchname"),
        sessionFields : this.get("sessionFields").clone()
      }); //MUST be a new model, other wise it wont save in a new pouch.
      s.get("sessionFields").where({label: "user"})[0].set("mask", app.get("authentication").get("userPrivate").get("username") );
      s.get("sessionFields").where({label: "consultants"})[0].set("mask", "XY");
      s.get("sessionFields").where({label: "goal"})[0].set("mask", "Change this session goal to the describe your first elicitiation session.");
      s.get("sessionFields").where({label: "dateSEntered"})[0].set("mask", new Date());
      s.get("sessionFields").where({label: "dateElicited"})[0].set("mask", "Change this to a time period for example: A few months ago, probably on a Monday night.");
      
      s.set("pouchname", this.get("pouchname"));
      s.set("dateCreated",JSON.stringify(new Date()));
      s.set("dateModified", JSON.stringify(new Date()));
      s.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl + this.get("pouchname") : Utils.pouchUrl + this.get("pouchname"));
      s.save(null, {
        success : function(model, response) {
          window.app.get("authentication").get("userPrivate").get("sessionHistory").unshift(model.id);
          self.get("sessions").unshift(model);

          if(typeof suces == "function"){
            suces();
          }else{
            Utils.debug('Session save success' + model.id);
          }
        },
        error : function(e) {
          if(typeof fail == "function"){
            fail();
          }else{
            Utils.debug('Session save error' + e);
          }
        }
      });
    },
    /**
     * If more views are added to corpora (or activity feeds) , add them here
     * @returns {} an object containing valid map reduce functions
     */
    validCouchViews : function(){
      return {
        "get_ids/by_date" : {
          map: function(doc) {if (doc.dateModified) {emit(doc.dateModified, doc);}}
        },
        "get_datum_field/get_datum_fields" : {
          map : function(doc) {if ((doc.datumFields) && (doc.session)) {var obj = {};for (i = 0; i < doc.datumFields.length; i++) {if (doc.datumFields[i].mask) {obj[doc.datumFields[i].label] = doc.datumFields[i].mask;}}if (doc.session.sessionFields) {for (j = 0; j < doc.session.sessionFields.length; j++) {if (doc.session.sessionFields[j].mask) {obj[doc.session.sessionFields[j].label] = doc.session.sessionFields[j].mask;}}}emit(obj, doc._id);}}
        }
      };
    },
    createPouchView: function(view, callbackpouchview){
      if(!window.validCouchViews){
        window.validCouchViews = this.validCouchViews();
      }
      var viewparts = view.split("/");
      if(viewparts.length != 2){
        console.log("Warning "+view+ " is not a valid view name.");
        return;
      }
      var corpusself = this;
      if(!this.get("couchConnection")){
        return;
      }
      this.changePouch(null, function() {
        corpusself.pouch(function(err, db) {
          var modelwithhardcodedid = {
              "_id": "_design/"+viewparts[0],
              "language": "javascript",
              "views": {
//                "by_id" : {
//                      "map": "function (doc) {if (doc.dateModified) {emit(doc.dateModified, doc);}}"
//                  }
              }
           };
          modelwithhardcodedid.views[viewparts[1]] = {map : window.validCouchViews[view].map.toString()};
          if(window.validCouchViews[view].reduce){
            modelwithhardcodedid.views[viewparts[1]].reduce =  window.validCouchViews[view].reduce.toString();
          }

          console.log("This is what the doc will look like: ", modelwithhardcodedid);
          db.put(modelwithhardcodedid, function(err, response) {
            Utils.debug(response);
            if(err){
              Utils.debug("The "+view+" view couldn't be created.");
            }else{
              
              Utils.debug("The "+view+" view was created.");
              if(typeof callbackpouchview == "function"){
                callbackpouchview();
              }
              
              
            }
          });
        });
      });
      
    },
    /**
     * Accepts two functions success will be called if successful,
     * otherwise it will attempt to render the current corpus views. If
     * the corpus isn't in the current corpus it will call the fail
     * callback or it will alert a bug to the user. Override the fail
     * callback if you don't want the alert.
     * 
     * @param successcallback
     * @param failurecallback
     */
    setAsCurrentCorpus : function(successcallback, failurecallback){
      //TODO think about how to switch corpuses... maybe take the most recent session and data list and set those at the same time, it should be okay.
//      if( window.app.get("corpus").get("pouchname") != this.get("pouchname") ){
//        if (typeof failurecallback == "function") {
//          failurecallback();
//        }else{
//          alert("This is a bug, cannot load the corpus you asked for, it is not in this corpus. This will make the app reload.");
//        }
//        return;
//      }else{
        if (window.app.get("corpus").id != this.id ) {
          window.app.set("corpus", this);
        }
        window.app.get("authentication").get("userPrivate").get("mostRecentIds").corpusid = this.id;
        window.app.get("authentication").saveAndInterConnectInApp();
        
        //If there is no view, we are done.
        if(! window.appView){
          successcallback();
          return;
        }
        
        //If there is a view, we should set up the corpus dashboard and render the team activity feed. TODO is this why the team activyfeed isnt working ona fresh app?
        try{
          window.appView.setUpAndAssociateViewsAndModelsWithCurrentCorpus(function() {
            window.appView.activityFeedCorpusTeamView.render(); //this gets destroyed in the re-associating. 
            if (typeof successcallback == "function") {
              successcallback();
            }else{
              window.appView.toastUser("Sucessfully connected all views up to corpus: "+ this.id,"alert-success","Connected!");
//            window.appView.renderEditableCorpusViews();
//            window.appView.renderReadonlyCorpusViews();
            }
          });
        }catch(e){
          if (typeof failurecallback == "function") {
            failurecallback();
          }else{
            alert("This is probably a bug. There was a problem rendering the current corpus's views after resetting the current session.");
          }
        }
    },
    /**
     * Synchronize the server and local databases. First to, then from.
     */
    replicateCorpus : function(couchConnection, successcallback, failurecallback) {
      var self = this;
      this.replicateToCorpus(couchConnection, function(){
        
        //if to was successful, call the from.
        self.replicateFromCorpus(couchConnection, successcallback, failurecallback );
        
      },function(){
        alert("Replicate to corpus failure");
        if(typeof fromcallback == "function"){
          fromcallback();
        }
      });
    },
    /**
     * Synchronize to server and from database.
     */
    replicateToCorpus : function(couchConnection, replicatetosuccesscallback, failurecallback) {
      var self = this;
      
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = self.get("couchConnection");
      }
      this.changePouch(couchConnection, function(){
        self.pouch(function(err, db) {
          var couchurl = couchConnection.protocol+couchConnection.domain;
          if(couchConnection.port != null){
            couchurl = couchurl+":"+couchConnection.port;
          }
          couchurl = couchurl +couchConnection.path+"/"+ couchConnection.pouchname;
          
          db.replicate.to(couchurl, { continuous: false }, function(err, response) {
            Utils.debug("Replicate to " + couchurl);
            Utils.debug(response);
            Utils.debug(err);
            if(err){
              if(typeof failurecallback == "function"){
                failurecallback();
              }else{
                alert('Corpus replicate to error' + JSON.stringify(err));
                Utils.debug('Corpus replicate to error' + JSON.stringify(err));
              }
            }else{
              Utils.debug("Corpus replicate to success", response);
              window.appView.allSyncedDoc();
//              var teamid = "";
//              var teamname = "";
//              try{
//                teamid = model.get("team")._id; //Works if UserMask came from a mongodb id
//                teamname = model.get("team").get("username");
//              }catch(e){
//                Utils.debug("Problem getting team details for the activity", e);
//              }
              window.app.get("currentCorpusTeamActivityFeed").addActivity(
                  new Activity({
                    verb : "uploaded",
                    verbmask : "uploaded",
                    verbicon : "icon-arrow-up",
                    directobject : "<a href='#corpus/"+self.id+"'>"+self.get('title')+"</a> (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "to the team server",
                    indirectobjectmask : "to its team server",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "team"
                  }));
              window.app.get("currentUserActivityFeed").addActivity(
                  new Activity({
                    verb : "uploaded",
                    verbmask : "uploaded",
                    verbicon : "icon-arrow-up",
                    directobject : "<a href='#corpus/"+self.id+"'>"+self.get('title')+"</a> (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "to the team server",
                    indirectobjectmask : "to its team server",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "personal"
                  }));
              
              
              
              //Replicate the team's activity feed, then call the sucess callback
              window.appView.activityFeedCorpusTeamView.model.replicateToActivityFeed(null, function(){
                if(typeof replicatetosuccesscallback == "function"){
//                  window.appView.renderActivityFeedViews();
                  replicatetosuccesscallback();
                }else{
                  Utils.debug("ActivityFeed Team replicate to success");
                }
              });
            }
          });
        });
      });
    },
    /**
     * Synchronize from server to local database.
     */
    replicateFromCorpus : function(couchConnection, successcallback, failurecallback) {
      var self = this;
      
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = self.get("couchConnection");
      }
      this.changePouch(couchConnection, function(){
        self.pouch(function(err, db) {
          var couchurl = couchConnection.protocol+couchConnection.domain;
          if(couchConnection.port != null){
            couchurl = couchurl+":"+couchConnection.port;
          }
          couchurl = couchurl  +couchConnection.path+"/"+ couchConnection.pouchname;
          
          
          //We can leave the to and from replication async, and make two callbacks. 
          db.replicate.from(couchurl, { continuous: false }, function(err, response) {
            Utils.debug("Replicate from " + couchurl);
            Utils.debug(response);
            Utils.debug(err);
            if(err){
              if(typeof failurecallback == "function"){
                failurecallback();
              }else{
                alert('Corpus replicate from error' + JSON.stringify(err));
                Utils.debug('Corpus replicate from error' + JSON.stringify(err));
              }
            }else{
              Utils.debug("Corpus replicate from success", response);

              //This was a valid connection, lets save it into localstorage.
              localStorage.setItem("mostRecentCouchConnection",JSON.stringify(couchConnection));
              
              if(typeof successcallback == "function"){
                successcallback();
              }
              if(window.app.get("currentCorpusTeamActivityFeed")){
                window.app.get("currentCorpusTeamActivityFeed").addActivity(
                  new Activity({
                    verb : "downloaded",
                    verbmask : "downloaded",
                    verbicon : "icon-arrow-down",
                    directobject : "<a href='#corpus/"+self.id+"'>"+self.get('title')+"</a>  (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "from the team server",
                    indirectobjectmask : "from its team server",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "team"
                  }));
              }
              if(window.app.get("currentUserActivityFeed")){
                window.app.get("currentUserActivityFeed").addActivity(
                  new Activity({
                    verb : "downloaded",
                    verbmask : "downloaded",
                    verbicon : "icon-arrow-down",
                    directobject : "<a href='#corpus/"+self.id+"'>"+self.get('title')+"</a> (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "from the team server",
                    indirectobjectmask : "from its team server",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "personal"
                  }));
              }
              
              // Get the corpus' current precedence rules
              self.buildMorphologicalAnalyzerFromTeamServer(self.get("pouchname"));
              
              // Build the lexicon
              self.buildLexiconFromTeamServer(self.get("pouchname"));
            }
          });
        });
        
      });
    },
    /**
     * Log the user into their corpus server automatically using cookies and post so that they can replicate later.
     * "http://localhost:5984/_session";
     * 
     * References:
     * http://guide.couchdb.org/draft/security.html
     * 
     * @param username this can come from a username field in a login, or from the User model.
     * @param password this comes either from the UserWelcomeView when the user logs in, or in the quick authentication view.
     * @param callback A function to call upon success, it receives the data back from the post request.
     */
    logUserIntoTheirCorpusServer : function(couchConnection, username, password, succescallback, failurecallback) {
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = this.get("couchConnection");
      }
      
      var couchurl = couchConnection.protocol + couchConnection.domain;
      if (couchConnection.port != null) {
        couchurl = couchurl + ":" + couchConnection.port;
      }
      if(!couchConnection.path){
        couchConnection.path = "";
        this.get("couchConnection").path = "";
      }
      couchurl = couchurl  + couchConnection.path + "/_session";
      var corpusloginparams = {};
      corpusloginparams.name = username;
      corpusloginparams.password = password;
      $.ajax({
        type : 'POST',
        url : couchurl ,
        data : corpusloginparams,
        success : function(data) {
          if(window.appView){
            window.appView.toastUser("I logged you into your team server automatically, your syncs will be successful.", "alert-info","Online Mode:");
          }
          if (typeof succescallback == "function") {
            succescallback(data);
          }
        },
        error : function(data){
          window.setTimeout(function(){
            //try one more time 5 seconds later 
            $.ajax({
              type : 'POST',
              url : couchurl ,
              data : corpusloginparams,
              success : function(data) {
                if(window.appView){
                  window.appView.toastUser("I logged you into your team server automatically, your syncs will be successful.", "alert-info","Online Mode:");
                }
                if (typeof succescallback == "function") {
                  succescallback(data);
                }
              },
              error : function(data){
                if(window.appView){
                  window.appView.toastUser("I couldn't log you into your corpus. What does this mean? " +
                      "This means you can't upload data to train an auto-glosser or visualize your morphemes. " +
                      "You also can't share your data with team members. If your computer is online and you are" +
                      " using the Chrome Store app, then this probably the side effect of a bug that we might not know about... please report it to us :) " +Utils.contactUs+
                      " If you're offline you can ignore this warning, and sync later when you're online. ","alert-danger","Offline Mode:");
                }
                if (typeof failurecallback == "function") {
                  failurecallback("I couldn't log you into your corpus.");
                }
                Utils.debug(data);
                window.app.get("authentication").set("staleAuthentication", true);
              }
            });
          }, 5000);
        }
      });
    },
    validate: function(attrs){
      if(attrs.publicCorpus){
        if(attrs.publicCorpus != "Public"){
          if(attrs.publicCorpus != "Private"){
            return "Corpus must be either Public or Private"; //TODO test this.
          }
        }
      }
    },
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
      if(attributes.title){
        attributes.titleAsUrl = attributes.title.toLowerCase().replace(/[!@#$^&%*()+=-\[\]\/{}|:<>?,."'`; ]/g,"_");//this makes the accented char unnecessarily unreadable: encodeURIComponent(attributes.title.replace(/ /g,"_"));
      }
      return Backbone.Model.prototype.set.call( this, attributes, options ); 
    },
    /**
     * This function takes in a pouchname, which could be different
     * from the current corpus incase there is a master corpus wiht
     * more/better monolingual data.
     * 
     * @param pouchname
     * @param callback
     */
    buildMorphologicalAnalyzerFromTeamServer : function(pouchname, callback){
      if(!pouchname){
        this.get("pouchname");
      }
      if(!callback){
        callback = null;
      }
      Glosser.downloadPrecedenceRules(pouchname, callback);
    },
    /**
     * This function takes in a pouchname, which could be different
     * from the current corpus incase there is a master corpus wiht
     * more/better monolingual data.
     * 
     * @param pouchname
     * @param callback
     */
    buildLexiconFromTeamServer : function(pouchname, callback){
      if(!pouchname){
        this.get("pouchname");
      }
      if(!callback){
        callback = null;
      }
      this.lexicon.buildLexiconFromCouch(pouchname,callback);
    },
    changeCorpusPublicPrivate : function(){
//      alert("TODO contact server to change the public private of the corpus");
    }
  });
    
  return Corpus;
});
