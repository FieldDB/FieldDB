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
     *           http://fieldlinguist.com/Sapir/SampleFieldLinguisticsCorpus
     * @property {String} description This is a short description that
     *           appears on the corpus details page
     * @property {String} remote The git url of the remote eg:
     *           git@fieldlinguist.com:Sapir/SampleFieldLinguisticsCorpus.git
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

      if(!this.get("confidential")){
        this.set("confidential", new Confidential() )
      }
      
      if(!this.get("publicSelf")){
        this.set("publicSelf", new CorpusMask({
          "couchConnection" : this.get("couchConnection"),
          "corpusname" : this.get("corpusname")
        }));
      }
      if(!this.get("publicCorpus")){
        this.set("publicCorpus", "Public");
      }
      this.bind("change:publicCorpus",this.changeCorpusPublicPrivate,this);
      
      if(typeof(this.get("datumStates")) == "function"){
        this.set("datumStates", new DatumStates([ 
//          new DatumState(),
          new DatumState({
            state : "To be checked",
            color : "warning"
          }),
          , new DatumState({
            state : "Deleted",
            color : "important"
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
            help: "Use this field to establish your team's gramaticality/acceptablity judgements (*,#,? etc)"
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
      
    },
    loadPermissions: function(){
      if (!this.get("team")){
        //If app is completed loaded use the user, otherwise put a blank user
        if(window.appView){
          this.set("team", window.app.get("authentication").get("userPublic"));
        }else{
//          this.set("team", new UserMask({corpusname: this.get("corpusname")}));
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
        corpusname: this.get("corpusname")
      }));
      
      this.permissions.add(new Permission({
        users: new Users(),
        role: "contributor",
        corpusname: this.get("corpusname")
      }));
      this.permissions.add(new Permission({
        users: new Users(), //"ifieldpublicuser"
        role: "collaborator",
        corpusname: this.get("corpusname")
      }));
      //TODO load the permissions in from the server.
    },
    
    defaults : {
      title : "Untitled Corpus",
      titleAsUrl :"UntitledCorpus",
      description : "This is an untitled corpus, created by default.",
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
//    glosser: new Glosser(),//DONOT store in attributes when saving to pouch (too big)
    lexicon: new Lexicon(),//DONOT store in attributes when saving to pouch (too big)
    changeCorpus : function(couchConnection, callback) {
      if (couchConnection == null || couchConnection == undefined) {
        couchConnection = this.get("couchConnection");
      }
      if (this.pouch == undefined) {
        this.pouch = Backbone.sync
        .pouch(Utils.androidApp() ? Utils.touchUrl
            + couchConnection.corpusname : Utils.pouchUrl
            + couchConnection.corpusname);
      }

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
        //uses the conventions to set the corpusname off of the team's username 
        if(!this.get("titleAsUrl")){
          this.set("titleAsUrl", encodeURIComponent(this.get("title").replace(/[^a-zA-Z0-9-._~]/g,"")));
        }
        if(!this.get("corpusname")){
          this.set("corpusname", this.get("team").get("username")
              +"-"+encodeURIComponent(this.get("title").replace(/[^a-zA-Z0-9-._~]/g,"").replace(/ /g,"")) );
        }
        if(!this.get("couchConnection")){
          this.get("couchConnection").corpusname = this.get("team").get("username")
          +"-"+encodeURIComponent(this.get("title").replace(/[^a-zA-Z0-9-._~]/g,"").replace(/ /g,"")) ;
        }
      }
      var oldrev = this.get("_rev");
      this.changeCorpus(null,function(){
        self.save(null, {
          success : function(model, response) {
            Utils.debug('Corpus save success');
            var title = model.get("title");
            var differences = "<a class='activity-diff' href='#diff/oldrev/"+oldrev+"/newrev/"+response._rev+"'>"+title+"</a>";
            //TODO add privacy for corpus in corpus
//            if(window.app.get("corpus").get("keepCorpusDetailsPrivate")){
//              title = "";
//              differences = "";
//            }
            var publicSelf = new CorpusMask(model.get("publicSelf"));
            publicSelf.changeCorpus(model.get("couchConnection"), function(){
              publicSelf.save();
            });
            
            if(window.appView){
              window.appView.toastUser("Sucessfully saved corpus: "+ title,"alert-success","Saved!");
              window.appView.addSavedDoc(model.id);
            }
            var verb = "updated";
            if(newModel){
              verb = "added";
            }
            window.app.get("authentication").get("userPrivate").get("activities").unshift(
                new Activity({
                  verb : verb,
                  directobject : "<a href='#corpus/"+model.id+"'>corpus "+title+"</a> ",
                  indirectobject : "owned by <a href='#user/"+model.get("team").id+"'>"+model.get("team").get("username")+"</a>",
                  context : differences+" via Offline App.",
                  user: window.app.get("authentication").get("userPublic")
                }));
            
            //make sure the corpus is in the history of the user
            if(window.app.get("authentication").get("userPrivate").get("corpuses").indexOf(model.get("couchConnection")) == -1){
              window.app.get("authentication").get("userPrivate").get("corpuses").unshift(model.get("couchConnection"));
            }
            /*
             * Save the default data list, in case it has changed without being saved in pouch. 
             */
            if(model.get("dataLists").length > 0){
              var defaultDatalist = model.get("dataLists").models[model.get("dataLists").length - 1];

              if(defaultDatalist.needsSave){
//                defaultDatalist.changeCorpus(null, function(){
//                  Utils.debug("Saving the default datalist because it was changed by adding datum, and it wasn't the current data list so it is was the 'active' defualt datalist.");
//                  defaultDatalist.save();
                //TODO uncomment this
//                });
              }
            }
            if(newModel){
              //TODO something similar to saving the current dashboard so the user can go back.
//              window.app.saveAndInterConnectInApp(function(){
               
              self.setAsCurrentCorpus(function(){

                if(model.get("sessions").models.length == 0 && model.get("dataLists").models.length == 0){
                  //create the first session for this corpus.
                  var s = new Session({
                    corpusname : model.get("corpusname"),
                    sessionFields : model.get("sessionFields").clone()
                  }); //MUST be a new model, other wise it wont save in a new pouch.
                  s.get("sessionFields").where({label: "user"})[0].set("mask", window.app.get("authentication").get("userPrivate").get("username") );
                  s.get("sessionFields").where({label: "consultants"})[0].set("mask", "AA");
                  s.get("sessionFields").where({label: "goal"})[0].set("mask", "To explore the app and try entering/importing data");
                  s.get("sessionFields").where({label: "dateSEntered"})[0].set("mask", new Date());
                  s.get("sessionFields").where({label: "dateElicited"})[0].set("mask", "A few months ago, probably on a Monday night.");
                  s.set("corpusname", model.get("corpusname"));
                  s.saveAndInterConnectInApp(function(){
                    s.setAsCurrentSession(function(){
                      
                      //create the first datalist for this corpus.
                      var dl = new DataList({
                        corpusname : model.get("corpusname")}); //MUST be a new model, other wise it wont save in a new pouch.
                      dl.set({
                        "title" : "Default Data List",
                        "dateCreated" : (new Date()).toDateString(),
                        "description" : "This is the default data list for this corpus. " +
                        "Any new datum you create is added here. " +
                        "Data lists can be used to create handouts, prepare for sessions with consultants, " +
                        "export to LaTeX, or share with collaborators.",
                        "corpusname" : model.get("corpusname")
                      });
                      dl.saveAndInterConnectInApp(function(){
                        dl.setAsCurrentDataList(function(){
                          window.appView.render();
                          window.appView.toastUser("Created a new session and datalist, and loaded them into the dashboard. This might not have worked perfectly.<a href='goback'>Go Back</a>");
                          window.app.get("authentication").saveAndInterConnectInApp();
                          if(typeof successcallback == "function"){
                            successcallback();
                          }
                        });
                      });
                    });
                  });
                }else{
                  if(typeof successcallback == "function"){
                    successcallback();
                  }
                }
              });
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
//      if( window.app.get("corpus").get("corpusname") != this.get("corpusname") ){
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
        
        try{
          window.appView.setUpAndAssociateViewsAndModelsWithCurrentCorpus(function() {
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
     * Synchronize the server and local databases.
     */
    replicateCorpus : function(couchConnection, fromcallback, tocallback) {
      var self = this;
      
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = self.get("couchConnection");
      }
      this.changeCorpus(couchConnection, function(){
        self.pouch(function(err, db) {
          var couchurl = couchConnection.protocol+couchConnection.domain;
          if(couchConnection.port != null){
            couchurl = couchurl+":"+couchConnection.port;
          }
          couchurl = couchurl +"/"+ couchConnection.corpusname;
          
          db.replicate.to(couchurl, { continuous: false }, function(err, resp) {
            Utils.debug("Replicate to " + couchurl);
            Utils.debug(resp);
            Utils.debug(err);
            if(typeof tocallback == "function"){
              tocallback();
            }
          });
          //We can leave the to and from replication async, and make two callbacks. 
          db.replicate.from(couchurl, { continuous: false }, function(err, resp) {
            Utils.debug("Replicate from " + couchurl);
            Utils.debug(resp);
            Utils.debug(err);
            if(err == null || err == undefined){
              //This was a valid connection, lets save it into localstorage.
              localStorage.setItem("mostRecentCouchConnection",JSON.stringify(couchConnection));
              
              // Display the most recent datum in this corpus
//              appView.datumsEditView.updateDatums(); //Im not sure i want to do this.. lets leave htem where they were.
            }
            if(typeof fromcallback == "function"){
              fromcallback();
            }
            window.appView.allSyncedDoc();
            
            window.app.get("authentication").get("userPrivate").get("activities").unshift(
                new Activity({
                  verb : "synced",
                  directobject : window.app.get("corpus").get("title"),
                  indirectobject : "with their team server",
                  context : "via Offline App",
                  user: window.app.get("authentication").get("userPublic")
                }));
            //Replicate the team's activity feed
            window.appView.activityFeedView.model.replicateActivityFeed();
            
            // Get the corpus' current precedence rules
            self.buildMorphologicalAnalyzerFromTeamServer(self.get("corpusname"));
            
            // Build the lexicon
            self.buildLexiconFromTeamServer(self.get("corpusname"));
          });
        });
        
      });
    },
    /**
     * Synchronize the server and local databases.
     */
    replicateToCorpus : function(couchConnection, fromcallback, tocallback) {
      var self = this;
      
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = self.get("couchConnection");
      }
      this.changeCorpus(couchConnection, function(){
        self.pouch(function(err, db) {
          var couchurl = couchConnection.protocol+couchConnection.domain;
          if(couchConnection.port != null){
            couchurl = couchurl+":"+couchConnection.port;
          }
          couchurl = couchurl +"/"+ couchConnection.corpusname;
          
          db.replicate.to(couchurl, { continuous: false }, function(err, resp) {
            Utils.debug("Replicate to " + couchurl);
            Utils.debug(resp);
            Utils.debug(err);
            if(typeof tocallback == "function"){
              tocallback();
            }
            window.appView.allSyncedDoc();
          });

          window.app.get("authentication").get("userPrivate").get("activities").unshift(
              new Activity({
                verb : "synced",
                directobject : window.app.get("corpus").get("title"),
                indirectobject : "to their team server",
                context : "via Offline App",
                user: window.app.get("authentication").get("userPublic")
              }));
          //Replicate the team's activity feed
          window.appView.activityFeedView.model.replicateActivityFeed();
        });
      });
    },
    /**
     * Synchronize the server and local databases.
     */
    replicateFromCorpus : function(couchConnection, fromcallback, tocallback) {
      var self = this;
      
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = self.get("couchConnection");
      }
      this.changeCorpus(couchConnection, function(){
        self.pouch(function(err, db) {
          var couchurl = couchConnection.protocol+couchConnection.domain;
          if(couchConnection.port != null){
            couchurl = couchurl+":"+couchConnection.port;
          }
          couchurl = couchurl +"/"+ couchConnection.corpusname;
          
          
          //We can leave the to and from replication async, and make two callbacks. 
          db.replicate.from(couchurl, { continuous: false }, function(err, resp) {
            Utils.debug("Replicate from " + couchurl);
            Utils.debug(resp);
            Utils.debug(err);
            if(err == null || err == undefined){
              //This was a valid connection, lets save it into localstorage.
              localStorage.setItem("mostRecentCouchConnection",JSON.stringify(couchConnection));
              
              // Display the most recent datum in this corpus
//              appView.datumsEditView.updateDatums();//TODO cesine: im not sure i want to do this, lets let the user stay where they were. we will update datums only when we load the dashboard by ids.
            }
            if(typeof fromcallback == "function"){
              fromcallback();
            }
//            window.appView.allSyncedDoc();
            
            window.app.get("authentication").get("userPrivate").get("activities").unshift(
                new Activity({
                  verb : "synced",
                  directobject : window.app.get("corpus").get("title"),
                  indirectobject : "from their team server",
                  context : "via Offline App",
                  user: window.app.get("authentication").get("userPublic")
                }));
            
            // Get the corpus' current precedence rules
            self.buildMorphologicalAnalyzerFromTeamServer(self.get("corpusname"));
            
            // Build the lexicon
            self.buildLexiconFromTeamServer(self.get("corpusname"));
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
    logUserIntoTheirCorpusServer : function(couchConnection, username, password, callback) {
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = this.get("couchConnection");
      }
      
      var couchurl = couchConnection.protocol + couchConnection.domain;
      if (couchConnection.port != null) {
        couchurl = couchurl + ":" + couchConnection.port;
      }
      couchurl = couchurl + "/_session";
      var corpusloginparams = {};
      corpusloginparams.name = username;
      corpusloginparams.password = password;
      $.ajax({
        type : 'POST',
        url : couchurl ,
        data : corpusloginparams,
        success : function(data) {
          window.appView.toastUser("I logged you into your team server automatically, your syncs will be successful.", "alert-info","Online Mode:");
          if (typeof callback == "function") {
            callback(data);
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
                window.appView.toastUser("I logged you into your team server automatically, your syncs will be successful.", "alert-info","Online Mode:");
                if (typeof callback == "function") {
                  callback(data);
                }
              },
              error : function(data){
                window.appView.toastUser("I couldn't log you into your corpus. What does this mean? " +
                		"This means you can't upload data to train an auto-glosser or visualize your morphemes. " +
                		"You also can't share your data with team members. Chances are if you are in offline mode, " +
                		"it is because you are using our website version instead of the Chrome Store app " +
                		"<a href='https://chrome.google.com/webstore/detail/niphooaoogiloklolkphlnhbbkdlfdlm'>" +
                		"https://chrome.google.com/webstore/detail/niphooaoogiloklolkphlnhbbkdlfdlm </a>  " +
                		"Our website version has a bug which we are waiting for IrisCouch (our database hosting company) to fix," +
                		" they said they would fix it soon. If your computer is online and you are the Chrome Store app, then this is a bug... please report it to us :)","alert-danger","Offline Mode:");
//                appView.datumsEditView.newDatum(); //show them a new datum rather than a blank screen when they first use the app
                appView.datumsEditView.render();

                Utils.debug(data);
                window.app.get("authentication").set("staleAuthentication", true);
              }
            });
          }, 5000);
        }
      });
    },
    validate: function(attrs){
//        console.log(attrs);
        if(attrs.title != undefined){
          attrs.titleAsUrl = encodeURIComponent(attrs.title); //TODO the validate on corpus is still not working.
        }
        
        if(attrs.publicCorpus){
          if(attrs.publicCorpus != "Public"){
            if(attrs.publicCorpus != "Private"){
              return "Corpus must be either Public or Private"; //TODO test this.
            }
          }
        }
        
//        return '';
    },
    /**
     * This function takes in a corpusname, which could be different
     * from the current corpus incase there is a master corpus wiht
     * more/better monolingual data.
     * 
     * @param corpusname
     * @param callback
     */
    buildMorphologicalAnalyzerFromTeamServer : function(corpusname, callback){
      if(!corpusname){
        this.get("corpusname");
      }
      if(!callback){
        callback = null;
      }
      Glosser.downloadPrecedenceRules(corpusname, callback);
    },
    /**
     * This function takes in a corpusname, which could be different
     * from the current corpus incase there is a master corpus wiht
     * more/better monolingual data.
     * 
     * @param corpusname
     * @param callback
     */
    buildLexiconFromTeamServer : function(corpusname, callback){
      if(!corpusname){
        this.get("corpusname");
      }
      if(!callback){
        callback = null;
      }
      this.lexicon.buildLexiconFromCouch(corpusname,callback);
    },
    changeCorpusPublicPrivate : function(){
      alert("TODO contact server to change the public private of the corpus");
    }
  });
    
  return Corpus;
});
