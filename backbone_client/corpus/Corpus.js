define([
    "backbone",
    "comment/Comment",
    "comment/Comments",
    "corpus/CorpusMask",
    "confidentiality_encryption/Confidential",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumState",
    "datum/DatumStates",
//    "text!/_view/datalists",
//    "text!/_view/sessions",
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
    "bower_components/fielddb-glosser/fielddb-glosser",
    "OPrime"
], function(
    Backbone,
    Comment,
    Comments,
    CorpusMask,
    Confidential,
    DatumField,
    DatumFields,
    DatumState,
    DatumStates,
//    forcingdataliststoloadearly,
//    forcingsessionstoloadearly,
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
     * @property {ConversationFields} conversationfields Collection of conversation-based datum fields used in the corpus
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
      if (OPrime.debugMode) OPrime.debug("CORPUS INIT");

      this.datalists =  new DataLists();
      this.sessions =  new Sessions();


      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
      this.bind("change:publicCorpus", this.changeCorpusPublicPrivate, this);

//      var couchConnection = this.get("couchConnection");
//      if(!couchConnection){
//        couchConnection = JSON.parse(localStorage.getItem("mostRecentCouchConnection"));
//        if(!localStorage.getItem("mostRecentCouchConnection")){
//          alert("Bug, need to take you back to the users page.");
//        }
//        this.set("couchConnection", couchConnection);
//      }
//      this.pouch = Backbone.sync
//      .pouch(OPrime.isAndroidApp() ? OPrime.touchUrl
//        + couchConnection.pouchname : OPrime.pouchUrl
//        + couchConnection.pouchname);

    },
    loadOrCreateCorpusByPouchName : function(couchConnection, sucessloadingorCreatingcallback){
      var couchurl = OPrime.getCouchUrl(couchConnection);
      var queryUrl = couchurl + "/_design/pages/_view/private_corpuses";

      var errorfunction = function(response) {
        OPrime.debug("There was a problem getting the corpusid." + JSON.stringify(response));
        OPrime.bug("There was a problem loading your corpus. Please report this error.");
        var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin("public-firstcorpus");
        window.location.replace(optionalCouchAppPath + "user.html");
      };

      // var errorfunction = function(model, xhr, options) {
      //   $(".spinner-status").html("Downloading Corpus...");

      //   if (OPrime.debugMode) OPrime.debug("Error fetching corpus  : ", model, xhr, options);
      //   if (corpusself.islooping) {
      //     OPrime.bug("Couldn't download this corpus to this device. There was an error replicating corpus..." + e);
      //     return;
      //   }
      //   corpusself.islooping = true;
      //   OPrime.bug("Trying to download this corpus to this device one more time..." + xhr.reason);
      //   corpusself.loadOrCreateCorpusByPouchName(couchConnection, sucessloadingorCreatingcallback);
      // };

      var corpusself = this;
      FieldDB.CORS.makeCORSRequest({
        type: 'GET',
        url: queryUrl
      }).then(function(serverResults) {

        if (!serverResults || !serverResults.rows || serverResults.rows.length === 0) {
          errorfunction("No corpus doc! this corpus is broken.");
        }
        var model = serverResults.rows[0].value;
        couchConnection.corpusid = model._id;
        // appids.corpusid = model._id;
        model.couchConnection = couchConnection;
        // corpusself.set(corpusself.parse(model));

        if (OPrime.debugMode) OPrime.debug("Corpus fetched successfully", model);
        $(".spinner-status").html("Loading Datalist...");
        corpusself.makeSureCorpusHasADataList(function() {
          corpusself.datalists.at(0).setAsCurrentDataList(function() {
            $(".spinner-status").html("Datalist loaded.");
          });
          $(".spinner-status").html("Loading Elicitation Session...");
          corpusself.makeSureCorpusHasASession(function() {
            corpusself.sessions.at(0).setAsCurrentSession(function() {
              $(".spinner-status").html("Session loaded.");
              if (typeof sucessloadingorCreatingcallback == "function") {
                sucessloadingorCreatingcallback();
              }
            });

            //end success to create new data list
          }, function() {
            alert("Failed to create a session. ");
          }); //end failure to create new data list
          //end success to create new data list
        }, function() {
          alert("Failed to create a datalist. ");
        }); //end failure to create new data list

      }, errorfunction);
    },
    fetchPublicSelf : function(){
      try{
        var corpusself = this;
        if(!this.get("publicSelf")){
          this.set("publicSelf", new CorpusMask());
        }
        this.get("publicSelf").id = "corpus";
        this.get("publicSelf").fetch({sucess: function(model, response, options){
          if (OPrime.debugMode) OPrime.debug("Success fetching corpus' public self: ", model, response, options);
        }, error: function(model, xhr, options){
          if (OPrime.debugMode) OPrime.debug("Error fetching corpus mask : ", model, xhr, options);
          corpusself.get("publicSelf").fillWithDefaults();
          corpusself.get("publicSelf").set("couchConnection", corpusself.get("couchConnection"));
          corpusself.get("publicSelf").set("pouchname", corpusself.get("pouchname"));
        }});
      }catch(e){
        OPrime.bug("");
      }
    },
    fillWithDefaults : function(donefillingcallback){
      if(!this.get("confidential")){
        this.set("confidential", new Confidential({filledWithDefaults : true}) );
      }

      if(!this.get("publicSelf")){
        this.set("publicSelf", new CorpusMask({
          "filledWithDefaults" : true,
          "couchConnection" : this.get("couchConnection"),
          "pouchname" : this.get("pouchname")
        }));
      }

      if(!this.get("publicCorpus")){
        this.set("publicCorpus", "Private");
      }

      if( !this.get("datumStates") || this.get("datumStates").length == 0 ){
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

      if(!this.get("datumFields") || this.get("datumFields").length == 0){
        this.set("datumFields", new DatumFields([
          new DatumField({
            label : "judgement",
            size : "3",
            shouldBeEncrypted: "",
            showToUserTypes: "linguist",
            userchooseable: "disabled",
            help: "Grammaticality/acceptability judgement (*,#,?, etc). Leaving it blank can mean grammatical/acceptable, or you can choose a new symbol for this meaning."
          }),
          new DatumField({
            label : "utterance",
            shouldBeEncrypted: "checked",
            showToUserTypes: "all",
            userchooseable: "disabled",
            help: "Unparsed utterance in the language, in orthography or transcription. Line 1 in your LaTeXed examples for handouts. Sample entry: amigas"
          }),
          new DatumField({
            label : "morphemes",
            shouldBeEncrypted: "checked",
            showToUserTypes: "linguist",
            userchooseable: "disabled",
            help: "Morpheme-segmented utterance in the language. Used by the system to help generate glosses (below). Can optionally appear below (or instead of) the first line in your LaTeXed examples. Sample entry: amig-a-s"
          }),
          new DatumField({
            label : "gloss",
            shouldBeEncrypted: "checked",
            showToUserTypes: "linguist",
            userchooseable: "disabled",
            help: "Metalanguage glosses of each individual morpheme (above). Used by the system to help gloss, in combination with morphemes (above). It is Line 2 in your LaTeXed examples. We recommend Leipzig conventions (. for fusional morphemes, - for morpheme boundaries etc)  Sample entry: friend-fem-pl"
          }),
          new DatumField({
            label : "syntacticCategory",
            shouldBeEncrypted: "checked",
            showToUserTypes: "linguist",
            userchooseable: "disabled",
            help: "This optional field is used by the machine to help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of syntactic category tagging you wish." +
            		" It could be very theoretical like Distributed Morphology (Sample entry: √-GEN-NUM)," +
            		" or very a-theroretical like the Penn Tree Bank Tag Set. (Sample entry: NNS) http://www.ims.uni-stuttgart.de/projekte/CorpusWorkbench/CQP-HTMLDemo/PennTreebankTS.html"
          }),
          new DatumField({
            label : "syntacticTreeLatex",
            shouldBeEncrypted: "checked",
            showToUserTypes: "linguist",
            userchooseable: "disabled",
            help: "This optional field is used by the machine to make LaTeX trees and help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of LaTeX Tree package (we use QTree by default) Sample entry: \Tree [.S NP VP ]"
          }),
          new DatumField({
            label : "translation",
            shouldBeEncrypted: "checked",
            showToUserTypes: "all",
            userchooseable: "disabled",
            help: "Free translation into whichever language your team is comfortable with (e.g. English, Spanish, etc). You can also add additional custom fields for one or more additional translation languages and choose which of those you want to export with the data each time. Line 3 in your LaTeXed examples. Sample entry: (female) friends"
          }),
          new DatumField({
            label : "tags",
            shouldBeEncrypted: "",
            showToUserTypes: "all",
            userchooseable: "disabled",
            help: "Tags for constructions or other info that you might want to use to categorize your data."
          }),
          new DatumField({
            label : "validationStatus",
            shouldBeEncrypted: "",
            showToUserTypes: "all",
            userchooseable: "disabled",
            help: "Any number of tags of data validity (replaces DatumStates). For example: ToBeCheckedWithSeberina, CheckedWithRicardo, Deleted etc..."
          }),
          new DatumField({
            label : "enteredByUser",
            shouldBeEncrypted: "",
            showToUserTypes: "all",
            readonly: true,
            user: {},
            userchooseable: "disabled",
            help: "The user who originally entered the datum"
          }),
          new DatumField({
            label : "modifiedByUser",
            shouldBeEncrypted: "",
            showToUserTypes: "all",
            readonly: true,
            users: [],
            userchooseable: "disabled",
            help: "An array of users who modified the datum"
          }),
        ]));
      }//end if to set datumFields

      if(!this.get("conversationFields") || this.get("conversationFields").length == 0 ){
          this.set("conversationFields", new DatumFields([
            new DatumField({
              label : "speakers",
              shouldBeEncrypted: "checked",
              userchooseable: "disabled",
              help: "Use this field to keep track of who your speaker is. You can use names, initials, or whatever your consultants prefer."
            }),
            new DatumField({
                label : "modality",
                shouldBeEncrypted: "",
                userchooseable: "disabled",
                help: "Use this field to indicate if this is a voice or gesture tier, or a tier for another modality."
            })
          ]));
      }

      if(!this.get("sessionFields") || this.get("sessionFields").length == 0){
        this.set("sessionFields", new DatumFields([
           new DatumField({
             label : "goal",
             shouldBeEncrypted: "",
             userchooseable: "disabled",
             help: "The goals of the elicitation session. Why did you get together today, was it the second day of field methods class, or you wanted to collect some stories from you grandmother, or was it to check on some data you found in the literature..."
           }),
          new DatumField({
            label : "consultants",
            shouldBeEncrypted: "",
            userMasks: [],
            help: "This is a comma seperated field of all the consultants who were present for this elicitation session. This field also contains a (hidden) array of consultant masks with more details about the consultants if they are not anonymous or are actual users of the system. ",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "dialect",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "The dialect of this session (as precise as you'd like)."
          }),
          new DatumField({
            label : "language",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "The language (or language family), if desired."
          }),
          new DatumField({
            label : "dateElicited",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "The date when the elicitation session took place."
          }),
          new DatumField({
            label : "user",
            shouldBeEncrypted: "",
            help: "This is the username of who created this elicitation session. There are other fields contains an array of participants and consultants. ",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "participants",
            shouldBeEncrypted: "",
            userMasks: [],
            help: "This is a comma seperated field of all the people who were present for this elicitation session. This field also contains a (hidden) array of user masks with more details about the people present, if they are not anonymous or are actual users of the system. ",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "dateSEntered",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "This field is deprecated, it was replaced by DateSessionEntered."
          }),
          new DatumField({
            label : "DateSessionEntered",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "The date when the elicitation session data was actually entered in the computer (could be different from the dateElicited, especailly if you usually elicit data with an audio recorder and/or a note book)."
          })
        ]));

      }//end if to set sessionFields


      // If there are no comments, create models
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
//      this.loadPermissions();

      if(typeof donefillingcallback == "function"){
        donefillingcallback();
      }
    },

    originalParse : Backbone.Model.prototype.parse,
    parse : function(originalModel){
      /* if this is just a couchdb save result, dont process it */
      if (originalModel.ok) {
        return this.originalParse(originalModel);
      }
      /* Use the couch connection defined by this app. */
      if (originalModel.couchConnection) {
        tmp = originalModel.couchConnection;
        originalModel.couchConnection = OPrime.defaultCouchConnection();
        originalModel.couchConnection.corpusid = tmp.corpusid;
        originalModel.couchConnection.pouchname = tmp.pouchname;
        originalModel.couchConnection.title = tmp.title;
        originalModel.couchConnection.description = tmp.description;
        originalModel.couchConnection.titleAsUrl = tmp.titleAsUrl;
      } else {
        // some versions of the FieldBD common in the spreadsheet js deprecated the couch connection
        originalModel.couchConnection = OPrime.defaultCouchConnection();
        originalModel.couchConnection.corpusid = tmp.corpusid;
        originalModel.couchConnection.pouchname = tmp.pouchname;
      }

      // some versions of the FieldBD common js in the spreadsheet removed the confidential?
      if(!originalModel.confidential){
        originalModel.confidential = {
          secretkey : new Confidential().secretKeyGenerator(),
          repairedTimestamp : Date.now()
        };
      }
      // if (!originalModel.team) {
      //   originalModel.team = {
      //     _id: "team",
      //     username: originalModel.pouchname.split("-")[0];
      //   };
      // }
      /* Update the corpus to show all fields which are defaults on corpora,
      they are only added permanently if saved. */
      var tempCorpus = new Corpus();
      tempCorpus.fillWithDefaults();

      var corpusFields = tempCorpus.get("datumFields").toJSON();
      var originalFieldLabels = _.pluck(originalModel.datumFields, "label");

      for(var field in corpusFields){
        if(originalFieldLabels.indexOf(corpusFields[field].label) === -1){
          OPrime.debug("Adding field to this corpus: "+corpusFields[field].label);
          originalModel.datumFields.push(corpusFields[field]);
        }
      }

      /* Update corpus to have default licensen and terms of use if the user hasnt defined them yet */
      if (!originalModel.copyright) {
        originalModel.copyright = "Default: Add names of the copyright holders of the corpus.";
      }
      var defaultLicense = {
        title: "Default: Creative Commons Attribution-ShareAlike (CC BY-SA).",
        humanReadable: "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
        link: "http://creativecommons.org/licenses/by-sa/3.0/"
      };
      if (!originalModel.license) {
        originalModel.license = defaultLicense;
      }
      var licenseUpdated = originalModel.license;
      if (typeof licenseUpdated == "string") {
        licenseUpdated = {};
      }
      if (!licenseUpdated.title) {
        licenseUpdated.title = defaultLicense.title;
        originalModel.license = licenseUpdated;
      }
      if (!licenseUpdated.humanReadable) {
        licenseUpdated.humanReadable = defaultLicense.humanReadable;
        originalModel.license = licenseUpdated;
      }
      if (!licenseUpdated.link) {
        licenseUpdated.link = defaultLicense.link;
        originalModel.license = licenseUpdated;
      }
      var defaultTerms = {
        humanReadable: "Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
      };
      var termsUpdated = originalModel.termsOfUse || originalModel.terms;
      if (!termsUpdated || typeof termsUpdated == "string") {
        termsUpdated = defaultTerms;
        originalModel.termsOfUse = defaultTerms;
      }
      /* upgrade to v1.99 using termsOfUse not terms */
      if(originalModel.terms){
        delete originalModel.terms;
      }

      var x;
      /* clean the datum fields for search */
      for (x in originalModel.datumFields) {
        originalModel.datumFields[x].mask = "";
        originalModel.datumFields[x].value = "";
        if (originalModel.datumFields[x].users) {
          originalModel.datumFields[x].users = [];
        }
        if (originalModel.datumFields[x].user) {
          originalModel.datumFields[x].user = {};
        }
        if (originalModel.datumFields[x].json) {
          originalModel.datumFields[x].json = {};
        }
      }
      for (x in originalModel.sessionFields) {
        originalModel.sessionFields[x].mask = "";
        originalModel.sessionFields[x].value = "";
      }

      return this.originalParse(originalModel);
    },

    /**
     * backbone-couchdb adaptor set up
     */

    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/private_corpuses",


    loadPermissions: function(doneLoadingPermissions){
      if (!this.get("team")){
        //If app is completed loaded use the user, otherwise put a blank user
        if(window.appView){
          this.set("team", window.app.get("authentication").get("userPublic"));
//          this.get("team").id = window.app.get("authentication").get("userPublic").id;
        }else{
//          this.set("team", new UserMask({pouchname: this.get("pouchname")}));
        }
      }

      var corpusself = this;
      // load the permissions in from the server.
      window.app.get("authentication").fetchListOfUsersGroupedByPermissions(function(users){
        var typeaheadusers =  [];
        for(var user in users.notonteam ){
          if(users.notonteam[user].username){
            typeaheadusers.push(users.notonteam[user].username);
          }else{
            if (OPrime.debugMode) OPrime.debug("This user is invalid", users.notonteam[user]);
          }
        }
        typeaheadusers = JSON.stringify(typeaheadusers);
        var potentialusers = users.allusers || [];
        corpusself.permissions = new Permissions();

        var admins = new Users();
        corpusself.permissions.add(new Permission({
          users : admins,
          role : "admin",
          typeaheadusers : typeaheadusers,
          potentialusers : potentialusers,
          pouchname: corpusself.get("pouchname")
        }));

        var writers = new Users();
        corpusself.permissions.add(new Permission({
          users: writers,
          role: "writer",
          typeaheadusers : typeaheadusers,
          potentialusers : potentialusers,
          pouchname: corpusself.get("pouchname")
        }));

        var readers = new Users();
        corpusself.permissions.add(new Permission({
          users: readers,
          role: "reader",
          typeaheadusers : typeaheadusers,
          potentialusers : potentialusers,
          pouchname: corpusself.get("pouchname")
        }));

        if(users.admins && users.admins.length > 0){
          for ( var u in users.admins) {
            if(!users.admins[u].username){
              continue;
            }
            var user = {"username" : users.admins[u].username};
            if(users.admins[u].gravatar){
              user.gravatar = users.admins[u].gravatar;
            }
            admins.models.push(new UserMask(user));
          }
        }
        if(users.writers && users.writers.length > 0){
          for ( var u in users.writers) {
            if(!users.writers[u].username){
              continue;
            }
            var user = {"username" : users.writers[u].username};
            if(users.writers[u].gravatar){
              user.gravatar = users.writers[u].gravatar;
            }
            writers.models.push(new UserMask(user));
          }
        }
        if(users.readers && users.readers.length > 0){
          for ( var u in users.readers) {
            if(!users.readers[u].username){
              continue;
            }
            var user = {"username" : users.readers[u].username};
            if(users.readers[u].gravatar){
              user.gravatar = users.readers[u].gravatar;
            }
            readers.models.push(new UserMask(user));
          }
        }
        //Set up the typeahead for the permissions edit

        if(typeof doneLoadingPermissions == "function"){
          doneLoadingPermissions();
        }
      });

    },

    defaults : {
      title : "Untitled Corpus",
      titleAsUrl :"UntitledCorpus",
      description : "This is an untitled corpus, created by default. Change its title and description by clicking on the pencil icon ('edit corpus').",
//      confidential :  Confidential,
//      consultants : Consultants,
//      datumStates : DatumStates,
//      datumFields : DatumFields,
//      conversationFields : DatumFields,
//      sessionFields : DatumFields,
//      searchFields : DatumFields,
//      couchConnection : JSON.parse(localStorage.getItem("mostRecentCouchConnection")) || OPrime.defaultCouchConnection()
    },

    // Internal models: used by the parse function
    internalModels : {
      confidential :  Confidential,
      consultants : Consultants,
      datumStates : DatumStates,
      datumFields : DatumFields,
      conversationFields : DatumFields,
      sessionFields : DatumFields,
      searchFields : DatumFields,
//      sessions : Sessions,
//      dataLists : DataLists,
      publicSelf : CorpusMask,
      comments: Comments,
      team: UserMask
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
    putInTrash : function(){
      OPrime.bug("Sorry deleting corpora is not available right now. Too risky... ");
      return;
      /* TODO contact server to delte the corpus, if the success comes back, then do this */
      this.set("trashed", "deleted"+Date.now());
      this.saveAndInterConnectInApp(function(){
      window.location.href="user.html";
      });
    },

    //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function(commentstring) {
      var m = new Comment({
        "text" : commentstring,
     });

      this.get("comments").add(m);
      window.appView.addUnsavedDoc(this.id);

      window.app.addActivity(
          {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <i class='icon-cloud'></i><a href='#corpus/"+this.id+"'>this corpus</a>",
            teamOrPersonal : "team",
            context : " via Offline App."
          });

      window.app.addActivity(
          {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <i class='icon-cloud'></i><a href='#corpus/"+this.id+"'>"+this.get('title')+"</a>",
            teamOrPersonal : "personal",
            context : " via Offline App."
          });
    },
    newSession : function() {
      $("#new-session-modal").show();
      //Save the current session just in case
      var self = this;
      window.app.get("currentSession").saveAndInterConnectInApp(function(){
        //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
        window.appView.sessionNewModalView.model = new Session({
          comments : new Comments(),
          pouchname : self.get("pouchname"),
          sessionFields : window.app.get("currentSession").get("sessionFields").clone()
        });
        window.appView.sessionNewModalView.model.fillWithDefaults();
        window.appView.sessionNewModalView.render();
      });
    },
    /*
     */
    newCorpus : function(){
      $("#new-corpus-modal").show();
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
      attributes.publicSelf = {filledWithDefaults: true};
      attributes.team = window.app.get("authentication").get("userPublic").toJSON();
      //clear out search terms from the new corpus's datum fields
      /* use default datum fields if this is going to based on teh users' first practice corpus */
      if(this.get("pouchname").indexOf("firstcorpus") > -1){
        attributes.datumFields = [];
      }
      for(var x in attributes.datumFields){
        attributes.datumFields[x].mask = "";
        attributes.datumFields[x].value = "";
      }
      //clear out search terms from the new corpus's conversation fields
      for(var x in attributes.conversationFields){
        attributes.conversationFields[x].mask = "";
        attributes.conversationFields[x].value = "";
      }
      //clear out search terms from the new corpus's session fields
      for(var x in attributes.sessionFields){
        attributes.sessionFields[x].mask = "";
        attributes.sessionFields[x].value = "";
      }


      window.appView.corpusNewModalView.model = new Corpus();
      //be sure internal models are parsed and built.
      window.appView.corpusNewModalView.model.set(window.appView.corpusNewModalView.model.parse(attributes));
      /* use default datum fields if this is going to based on teh users' first practice corpus */
      window.appView.corpusNewModalView.model.fillWithDefaults();
      window.appView.corpusNewModalView.render();
    },
    newCorpusSimple : function(){
      $("#new-corpus-modal").show();
      //Save the current session just in case
      this.saveAndInterConnectInApp();
      var attributes = {};
      attributes.title = this.get("title")+ " copy";
      attributes.titleAsUrl = this.get("titleAsUrl")+"Copy";
      attributes.pouchname = this.get("pouchname")+"copy";
      attributes.couchConnection.pouchname = this.get("pouchname")+"copy";
      attributes.publicSelf = {};
      attributes.team = window.app.get("authentication").get("userPublic").toJSON();

      window.appView.corpusNewModalView.model = new Corpus();
      window.appView.corpusNewModalView.model.set(window.appView.corpusNewModalView.model.parse(attributes));
      window.appView.corpusNewModalView.render();
    },

//    glosser: new Glosser(),//DONOT store in attributes when saving to pouch (too big)
    lexicon: new Lexicon(),//DONOT store in attributes when saving to pouch (too big)
    prepareANewPouch : function(couchConnection, callback) {
      if (!couchConnection || couchConnection == undefined) {
        console.log("App.changePouch couchConnection must be supplied.");
        return;
      } else {
        console.log("prepareANewPouch setting couchConnection: ", couchConnection);
      }
//      alert("TODO set/validate that the the backone couchdb connection is the same as what user is asking for here");
//      $.couch.urlPrefix = OPrime.getCouchUrl(window.app.get("couchConnection"),"");

      if(OPrime.isChromeApp()){
        Backbone.couch_connector.config.base_url = window.app.getCouchUrl(couchConnection,"");
        Backbone.couch_connector.config.db_name = couchConnection.pouchname;
      }else{
        Backbone.couch_connector.config.db_name = couchConnection.pouchname;
      }

      if(typeof callback == "function"){
        callback();
      }
      return;




      alert("TODO set/validate that the the pouch connection");
      if (this.pouch == undefined) {
        // this.pouch = Backbone.sync.pouch("https://localhost:6984/"
        // + couchConnection.pouchname);
        this.pouch = Backbone.sync
        .pouch(OPrime.isAndroidApp() ? OPrime.touchUrl
            + couchConnection.pouchname : OPrime.pouchUrl
            + couchConnection.pouchname);
      }
      if (typeof callback == "function") {
        callback();
      }
    },
    'createCorpus': function(dataToPost) {
      dataToPost.serverCode = OPrime.getMostLikelyUserFriendlyAuthServerName().toLowerCase();
      dataToPost.authUrl = OPrime.defaultCouchConnection().authUrl;
      dataToPost.newCorpusName = this.get("title");

      var functionForError = function(err){
        console.log(JSON.stringify(err));
        var message = "Error creating your new corpus. "
        if (err.userFriendlyErrors) {
          message = message + err.userFriendlyErrors;
        }
        window.app.stopSpinner();
        window.appView.toastUser(message, "alert-danger","New Corpus:");
        $("#new-corpus-modal").find(".alert-danger").removeClass("hide");
        $("#new-corpus-modal").find(".alert-danger").html(message);
        $("#new-corpus-modal").show();
        window.location.href = "#render/true";
      };
      var config = {
        method: "POST",
        withCredentials: true,
        url: dataToPost.authUrl + "/newcorpus",
        data: dataToPost,
        success: function(response) {
          console.log("Created new corpus.");
          console.log(JSON.stringify(response));
          if (response.userFriendlyErrors) {
            functionForError(response);
          } else {
            $(".spinner-status").html("Corpus created, waiting for it to be ready to use...");

            /*
             * Redirect the user to their user page, being careful to use their (new) database if they are in a couchapp (not the database they used to register/create this corpus)
             */
            var potentialpouchname = response.corpus.pouchname;
            var couchConnection =OPrime.defaultCouchConnection();
            couchConnection.pouchname =potentialpouchname;
            var nextCorpusUrl = OPrime.getCouchUrl(couchConnection)+ "/_design/pages/_view/private_corpuses";

            OPrime.checkToSeeIfCouchAppIsReady(nextCorpusUrl , function() {
              //              OPrime.bug("Attempting to save the new corpus in its database.");
              if (OPrime.isBackboneCouchDBApp()) {
                try {
                  Backbone.couch_connector.config.db_name = potentialpouchname;
                } catch (e) {
                  OPrime.bug("Couldn't set the database name off of the pouchame when creating a new corpus for you, please report this.");
                }
              } else {
                alert("TODO test what happens when not in a backbone couchdb app and creating a corpus for an existing user.");
              }

              window.setTimeout(function() {
                var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin(potentialpouchname);
                window.location.replace(optionalCouchAppPath + "user.html#/corpus/" + potentialpouchname );
              }, 1000);

            });

          }
        }
      };
      window.app.router.hideEverything();
      window.app.showSpinner();
      $(".spinner-status").html("Contacting the server to create a database for your corpus...");
      FieldDB.CORS.makeCORSRequest(config).then(config.success, functionForError);

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
      if (OPrime.debugMode) OPrime.debug("Saving the Corpus");
      var self = this;
      var newModel = false;

      /* Upgrade chrome app user corpora's to v1.38+ */
      var oldCouchConnection = this.get("couchConnection");
      if(oldCouchConnection){
        if(oldCouchConnection.domain == "ifielddevs.iriscouch.com"){
          oldCouchConnection.domain  = "corpus.lingsync.org";
          oldCouchConnection.port = "";
          this.set("couchConnection", oldCouchConnection);
        }
        if(oldCouchConnection.domain == "orpusdev.lingsync.org"){
          oldCouchConnection.domain  = "corpus.lingsync.org";
          this.set("couchConnection", oldCouchConnection);
        }
      }

      if(!this.id){
        alert("This is a strange situation...The app is trying to create a corpus.");
        return;
      }else{
        this.get("couchConnection").corpusid = this.id;
        if(!this.get("couchConnection").path){
          this.get("couchConnection").path = "";
        }
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
        if (OPrime.debugMode) OPrime.debug("Removing empty states work around failed some thing was wrong.",e);
      }

      this.set("timestamp", Date.now());

        self.save(null, {
          success : function(model, response) {
            if (OPrime.debugMode) OPrime.debug('Corpus save success');
            var title = model.get("title");
            var differences = "#diff/oldrev/"+oldrev+"/newrev/"+response._rev;
            //TODO add privacy for corpus in corpus
//            if(window.app.get("corpus").get("keepCorpusDetailsPrivate")){
//              title = "";
//              differences = "";
//            }
            //save the corpus mask too
            var publicSelfMode = model.get("publicSelf");
            publicSelfMode.set("corpusid", model.id);
            publicSelfMode.saveAndInterConnectInApp();

            if(window.appView){
              window.appView.toastUser("Sucessfully saved corpus: "+ title,"alert-success","Saved!");
              window.appView.addSavedDoc(model.id);
            }
            var verb = "modified";
            verbicon = "icon-pencil";
            if(newModel){
              verb = "added";
              verbicon = "icon-plus";
            }
            var teamid = model.get("team").id; //Works if UserMask was saved
            if(!teamid){
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
              window.app.addActivity(
                  {
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "created by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    indirectobject : "created by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "personal"
                  });
              window.app.addActivity(
                  {
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "created by <a href='#user/"+teamid+"'>this team</a>",
                    indirectobject : "created by <a href='#user/"+teamid+"'>this team</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "team"
                  });
            }else{
              window.app.addActivity(
                  {
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "created by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    indirectobject : "created by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "personal"
                  });
              window.app.addActivity(
                  {
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "created by <a href='#user/"+teamid+"'>this team</a>",
                    indirectobject : "created by <a href='#user/"+teamid+"'>this team</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "team"
                  });
            }
            model.get("couchConnection").corpusid = model.id;
            //make sure the corpus is updated in the history of the user
            var pouches = _.pluck(window.app.get("authentication").get("userPrivate").get("corpuses"), "pouchname");
            var oldconnection = pouches.indexOf(model.get("couchConnection").pouchname);
            if(oldconnection != -1){
              window.app.get("authentication").get("userPrivate").get("corpuses").splice(oldconnection, 1);
            }
            window.app.get("authentication").get("userPrivate").get("corpuses").unshift(model.get("couchConnection"));

            if(newModel){

              self.makeSureCorpusHasADataList(function(){
                self.makeSureCorpusHasASession(function(){
                  //save the internal models go to the user dashboard to to load the corpus into the dashboard
                  self.save(null, {
                    success : function(model, response) {
                      window.app.get("authentication").saveAndInterConnectInApp(function(){

                      });
                    },error : function(e,f,g) {
                      alert('New Corpus save error' + f.reason);
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
          error : function(model, response, options) {
            if (OPrime.debugMode) OPrime.debug("Corpus save error", model, response, options);
//            if(response && response.reason && response.reason == "unauthorized"){
//              alert('Corpus save error: ' + response.reason);
//              window.app.get("authentication").syncUserWithServer(function(){
//
//              });
//            }

            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
            }
          }
        });
    },
    makeSureCorpusHasADataList : function(sucess, failure){
      if(!this.datalists){
        this.datalists = new DataLists();
      }
      if(this.datalists.length > 0){
        if (typeof sucess == "function"){
          sucess();
          return;
        }
      }

      var self = this;
      this.datalists.fetch({
        error : function(model, xhr, options) {
          OPrime.bug("There was an error loading your datalists.");
          console.log(model,xhr,options);
          OPrime.bug("There was an error loading your datalists.");
        },
        success : function(model, response, options) {
          if (response.length > 0) {
            if(typeof sucess == "function"){
              sucess();
            }else{
              if (OPrime.debugMode) OPrime.debug('the corpus has datalists');
            }
          }else{
            if (OPrime.debugMode) OPrime.debug("You have no datalists, creating a new one...");
          //create the first datalist for this corpus.
            var dl = new DataList({
              filledWithDefaults: true,
              pouchname : self.get("pouchname")
              }); //MUST be a new model, other wise it wont save in a new pouch.
            dl.set({
              "title" : "Default Datalist - Empty",
              "dateCreated" : (new Date()).toDateString(),
              "description" : "The app comes with a default datalist which is empty. " +
              "Once you have data in your corpus, you can create a datalist using Search. Imported data will also show up as a datalist. " +
              "Datalists can be used to create handouts, export to LaTeX, or share with collaborators.",
              "pouchname" : self.get("pouchname")
            });
            dl.set("dateCreated",JSON.stringify(new Date()));
            dl.set("dateModified", JSON.stringify(new Date()));
            if(!OPrime.isBackboneCouchDBApp()){
              alert("TODO test this setting pouch");
//              dl.pouch = Backbone.sync.pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + self.get("pouchname") : OPrime.pouchUrl + self.get("pouchname"));
            }
            dl.save(null, {
              success : function(model, response) {
                window.app.get("authentication").get("userPrivate").get("dataLists").unshift(model.id);
                self.datalists.unshift(model);

                if(typeof sucess == "function"){
                  sucess();
                }else{
                  if (OPrime.debugMode) OPrime.debug('DataList save success' + model.id);
                }
              },
              error : function(e) {
                if(typeof failure == "function"){
                  failure();
                }else{
                  if (OPrime.debugMode) OPrime.debug('DataList save error' + e);
                }
              }
            });
          }
        }
      });
    },

    makeSureCorpusHasASession : function(suces, fail){
      if(!this.sessions){
        this.sessions = new Sessions();
      }
      if(this.sessions.length > 0){
        if (typeof suces == "function"){
          suces();
          return;
        }
      }
      var self = this;
      this.sessions.fetch({
        error : function(model, xhr, options) {

          if (OPrime.debugMode) OPrime.debug("There was an error loading your sessions.");
          console.log(model,xhr,options);
          OPrime.bug("There was an error loading your sessions.");

        },
        success : function(model, response, options) {
          if (response.length > 0) {
            if(typeof suces == "function"){
              suces();
            }else{
              if (OPrime.debugMode) OPrime.debug('the corpus has sessions');
            }
          }else{
            if (OPrime.debugMode) OPrime.debug("You have no sessions, creating a new one...");
            var s = new Session({
              sessionFields : self.get("sessionFields").clone(),
              filledWithDefaults: true,
              pouchname : self.get("pouchname")
            }); //MUST be a new model, other wise it wont save in a new pouch.
            s.set("dateCreated",JSON.stringify(new Date()));
            s.set("dateModified", JSON.stringify(new Date()));

            if(!OPrime.isBackboneCouchDBApp()){
              alert("TODO test this setting pouch");
//              s.pouch = Backbone.sync.pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + self.get("pouchname") : OPrime.pouchUrl + self.get("pouchname"));
            }
            s.save(null, {
              success : function(model, response) {
                window.app.get("authentication").get("userPrivate").get("sessionHistory").unshift(model.id);
                self.sessions.unshift(model);

                if(typeof suces == "function"){
                  suces();
                }else{
                  if (OPrime.debugMode) OPrime.debug('Session save success' + model.id);
                }
              },
              error : function(e) {
                if(typeof fail == "function"){
                  fail();
                }else{
                  if (OPrime.debugMode) OPrime.debug('Session save error' + e);
                }
              }
            });
          }
        }
      });
    },
    /**
     * If more views are added to corpora, add them here
     * @returns {} an object containing valid map reduce functions
     * TODO: add conversation search to the get_datum_fields function
     */
    validCouchViews : function(){
      return {
        "pages/datums" : {
          map: /* updated to be compatible with pre-1.38 databases */
            function(doc) {
                try {
                    /* if this document has been deleted, the ignore it and return immediately */
                    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
                    if (doc.collection == "datums" || (doc.datumFields && doc.session)) {
                        var dateModified = doc.dateModified;
                        if (dateModified) {
                            try {
                                dateModified = dateModified.replace(/"/g, "");
                                dateModified = new Date(dateModified);
                                /* Use date modified as a timestamp if it isnt one already */
                                dateModified = dateModified.getTime();
                            } catch (e) {
                                //emit(error, null);
                            }
                        }
                        emit(dateModified, doc);
                    }
                } catch (e) {
                    //emit(e, 1);
                }
            }
        },
        "pages/get_datum_fields" : {
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
      if(OPrime.isBackboneCouchDBApp()){
        //TODO make the view in couchdb shouldnt be necessary since it was created in the couchapp?
        if(typeof callbackpouchview == "function"){
          callbackpouchview();
        }
        return;
      }
      if(!corpusself.pouch){
        alert("TODO test this creating a view");
        if(typeof callbackpouchview == "function"){
          callbackpouchview();
        }
        return;
      }

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
            if (OPrime.debugMode) OPrime.debug(response);
            if(err){
              if (OPrime.debugMode) OPrime.debug("The "+view+" view couldn't be created.");
            }else{

              if (OPrime.debugMode) OPrime.debug("The "+view+" view was created.");
              if(typeof callbackpouchview == "function"){
                callbackpouchview();
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
      if (window.app.get("corpus").id != this.id ) {
        window.app.set("corpus", this);
      }
      window.app.get("authentication").get("userPrivate").get("mostRecentIds").corpusid = this.id;
      window.app.get("authentication").get("userPrivate").get("mostRecentIds").couchConnection = this.get("couchConnection");
      window.app.get("authentication").saveAndInterConnectInApp();

      //If there is no view, we are done.
      if(! window.appView){
        successcallback();
        return;
      }

      if(window.appView){
        window.appView.setUpAndAssociateViewsAndModelsWithCurrentCorpus(function() {
          if (typeof successcallback == "function") {
            successcallback();
          }else{
            window.appView.toastUser("Sucessfully connected all views up to corpus: "+ this.id,"alert-success","Connected!");
//          window.appView.renderEditableCorpusViews();
//          window.appView.renderReadonlyCorpusViews();
          }
        });
      }else{
        if (typeof successcallback == "function") {
          successcallback();
        }
      }
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
     * from the current corpus in case there is a master corpus with
     * more/better monolingual data.
     *
     * @param pouchname
     * @param callback
     */
    buildMorphologicalAnalyzerFromTeamServer: function(pouchname, callback) {
      if (!pouchname) {
        this.get("pouchname");
      }
      if (!callback) {
        callback = null;
      }
      var glosserURL = this.get("glosserURL");
      if (!glosserURL) {
        var couchurl = OPrime.getCouchUrl(this.get("couchConnection"));
        glosserURL = couchurl + "/_design/pages/_view/precedence_rules?group=true";
      }
      Glosser.downloadPrecedenceRules(pouchname, glosserURL, callback);
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

    /**
     * This function takes in a pouchname, which could be different
     * from the current corpus incase there is a master corpus wiht
     * more representative datum
     * example : https://corpusdev.lingsync.org/lingllama-cherokee/_design/pages/_view/get_frequent_fields?group=true
     *
     * It takes the values stored in the corpus, if set, otherwise it will take the values from this corpus since the window was last refreshed
     *
     * If a url is passed, it contacts the server for fresh info.
     *
     * @param pouchname
     * @param callback
     */
    getFrequentDatumFields : function(jsonUrl, pouchname, callback){
      if(!jsonUrl){
        /* if we have already asked the server in this session, return */
        if(this.frequentDatumFields){
          if(typeof callback == "function"){
            callback(this.frequentDatumFields);
          }
          return;
        }
        var couchConnection = this.get("couchConnection");
        var couchurl = OPrime.getCouchUrl(couchConnection);
        if(!pouchname){
          pouchname = couchConnection.pouchname;
          /* if the user has overriden the frequent fields, use their preferences */
          if(this.get("frequentDatumFields")){
            if(typeof callback == "function"){
              callback(this.get("frequentDatumFields"));
            }
            return;
          }
        }
        jsonUrl = couchurl + "/_design/pages/_view/get_frequent_fields?group=true";
      }

      var self = this;
      FieldDB.CORS.makeCORSRequest({
        type: 'GET',
        url: jsonUrl
      }).then(function(serverResults) {
        OPrime.debug("serverResults" + JSON.stringify(serverResults));

        var counts = _.pluck(serverResults.rows, "value");
        if (OPrime.debugMode) OPrime.debug(counts);
        var frequentFields = [];
        try {
          var totalDatumCount = serverResults.rows[(_.pluck(
            serverResults.rows, "key").indexOf("datumTotal"))].value;

          for (var field in serverResults.rows) {
            if (serverResults.rows[field].key == "datumTotal") {
              continue;
            }
            if (serverResults.rows[field].value / totalDatumCount * 100 > 50) {
              if (OPrime.debugMode) OPrime.debug("Considering " + serverResults.rows[field].key + " as frequent (in more than 50% of datum) : " + serverResults.rows[field].value / totalDatumCount * 100);
              frequentFields.push(serverResults.rows[field].key);
            }
          }
        } catch (e) {
          if (OPrime.debugMode) OPrime.debug("There was a problem extracting the frequentFields, instead using defaults : ", e);
          frequentFields = ["judgement", "utterance", "morphemes", "gloss", "translation"];
        }
        if (frequentFields == []) {
          frequentFields = ["judgement", "utterance", "morphemes", "gloss", "translation"];
        }

        /*
         * Hide machine only fields:
         */
        var doesThisCorpusHaveSyntacticCategory = frequentFields.indexOf("syntacticCategory");
        if (doesThisCorpusHaveSyntacticCategory > -1) {
          frequentFields.splice(doesThisCorpusHaveSyntacticCategory, 1);
        }
        var doesThisCorpusHaveSyntacticTreeLatex = frequentFields.indexOf("syntacticTreeLatex");
        if (doesThisCorpusHaveSyntacticTreeLatex > -1) {
          frequentFields.splice(doesThisCorpusHaveSyntacticTreeLatex, 1);
        }

        self.frequentDatumFields = frequentFields;
        if (typeof callback == "function") {
          callback(frequentFields);
        }
      }, function(response) {
        OPrime
          .debug("There was a problem getting the frequent datum fields, using defaults." + JSON.stringify(response));
        if (typeof callback == "function") {
          callback(["judgement", "utterance", "morphemes", "gloss", "translation"]);
        }

        //end error
      });
    },
    /**
     * This function takes in a pouchname, which could be different
     * from the current corpus incase there is a master corpus wiht
     * more representative datum
     * example : https://corpusdev.lingsync.org/lingllama-cherokee/_design/pages/_view/get_corpus_validationStati?group=true
     *
     * It takes the values stored in the corpus, if set, otherwise it will take the values from this corpus since the window was last refreshed
     *
     * If a url is passed, it contacts the server for fresh info.
     *
     * @param pouchname
     * @param callback
     */
    getFrequentDatumValidationStates : function(jsonUrl, pouchname, callback){
      if(window.getFrequentDatumValidationStatesPending){
        return;
      }
      window.getFrequentDatumValidationStatesPending = true;
      if(!jsonUrl){
        /* if we have already asked the server in this session, return */
        if(this.frequentDatumValidationStates){
          if(typeof callback == "function"){
            callback(this.frequentDatumValidationStates);
          }
          return;
        }
        var couchConnection = this.get("couchConnection");
        var couchurl = OPrime.getCouchUrl(couchConnection);
        if(!pouchname){
          pouchname = couchConnection.pouchname;
          /* if the user has overriden the frequent fields, use their preferences */
          if(this.get("frequentDatumValidationStates")){
            if(typeof callback == "function"){
              callback(this.get("frequentDatumValidationStates"));
            }
            return;
          }
        }
        jsonUrl = couchurl + "/_design/pages/_view/get_corpus_validationStati?group=true";
      }

      var self = this;
      FieldDB.CORS.makeCORSRequest({
        type: 'GET',
        url: jsonUrl
      }).then(function(serverResults) {
        OPrime.debug("serverResults" + JSON.stringify(serverResults));

        var counts = _.pluck(serverResults.rows, "value");
        if (OPrime.debugMode) OPrime.debug(counts);
        var frequentStates = _.pluck(serverResults.rows, "key");
        if (frequentStates == []) {
          frequentStates = ["Checked", "Deleted", "ToBeCheckedWithAnna", "ToBeCheckedWithBill", "ToBeCheckedWithClaude"];
        }


        self.frequentDatumValidationStates = frequentStates;
        if (typeof callback == "function") {
          callback(frequentStates);
        }
        window.getFrequentDatumValidationStatesPending = false;

      }, function(response) {
        OPrime
          .debug("There was a problem getting the frequentDatumValidationStates, using defaults." + JSON.stringify(response));
        if (typeof callback == "function") {
          callback(["Checked", "Deleted", "ToBeCheckedWithAnna", "ToBeCheckedWithBill", "ToBeCheckedWithClaude"]);
        }
        window.getFrequentDatumValidationStatesPending = false;

        //end error
      });
    },
    /**
     * This function takes in a pouchname, which could be different
     * from the current corpus incase there is a master corpus wiht
     * more representative datum
     * example : https://corpusdev.lingsync.org/lingllama-cherokee/_design/pages/_view/get_corpus_validationStati?group=true
     *
     * It takes the values stored in the corpus, if set, otherwise it will take the values from this corpus since the window was last refreshed
     *
     * If a url is passed, it contacts the server for fresh info.
     *
     * @param pouchname
     * @param callback
     */
    getFrequentDatumTags : function(jsonUrl, pouchname, callback){
      if(window.getFrequentDatumTagsPending){
        return;
      }
      window.getFrequentDatumTagsPending = true;
      if(!jsonUrl){
        /* if we have already asked the server in this session, return */
        if(this.frequentDatumTags){
          if(typeof callback == "function"){
            callback(this.frequentDatumTags);
          }
          return;
        }
        var couchConnection = this.get("couchConnection");
        var couchurl = OPrime.getCouchUrl(couchConnection);
        if(!pouchname){
          pouchname = couchConnection.pouchname;
          /* if the user has overriden the frequent fields, use their preferences */
          if(this.get("frequentDatumTags")){
            if(typeof callback == "function"){
              callback(this.get("frequentDatumTags"));
            }
            return;
          }
        }
        jsonUrl = couchurl + "/_design/pages/_view/get_corpus_datum_tags?group=true";
      }

      var self = this;
      FieldDB.CORS.makeCORSRequest({
        type: 'GET',
        url: jsonUrl
      }).then(function(serverResults) {
        OPrime.debug("serverResults" + JSON.stringify(serverResults));

        var counts = _.pluck(serverResults.rows, "value");
        if (OPrime.debugMode) OPrime.debug(counts);
        var frequentTags = _.pluck(serverResults.rows, "key");
        if (frequentTags == []) {
          frequentTags = ["Passive", "WH", "Indefinte", "Generic", "Agent-y", "Causative", "Pro-drop", "Ambigous"];
        }

        self.frequentDatumTags = frequentTags;
        if (typeof callback == "function") {
          callback(frequentTags);
        }
        window.getFrequentDatumTagsPending = false;

      }, function(response) {
        OPrime
          .debug("There was a problem getting the frequentDatumTags, using defaults." + JSON.stringify(response));
        if (typeof callback == "function") {
          callback(["Passive", "WH", "Indefinte", "Generic", "Agent-y", "Causative", "Pro-drop", "Ambigous"]);
        }
        window.getFrequentDatumTagsPending = false;

        //end error
      });
    },
    changeCorpusPublicPrivate : function(){
//      alert("TODO contact server to change the public private of the corpus");
    }
  });

  return Corpus;
});
