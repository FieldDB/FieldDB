define([
    "backbone",
    "activity/Activity",
    "comment/Comment",
    "comment/Comments",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumState",
    "datum/DatumStates",
    "user/Consultants",
    "lexicon/Lexicon",
    "permission/Permission",
    "permission/Permissions",
    "bower_components/fielddb-glosser/fielddb-glosser",
    "OPrime"
], function(
    Backbone,
    Activity,
    Comment,
    Comments,
    DatumField,
    DatumFields,
    DatumState,
    DatumStates,
    Consultants,
    Lexicon,
    Permission,
    Permissions
) {
  var CorpusMask = Backbone.Model.extend(
  /** @lends CorpusMask.prototype */
  {
    /**
     * @class The CorpusMask is saved as corpusmask in the Couch repository, it is the publicly visible version of a corpus. By default it just says private but lets users see the data lists and sessions.
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

        // this.datalists =  new DataLists();
      // this.sessions =  new Sessions();

      //Hard code this corpus' id so that it will be findable without an id if one knows the corpus name
      this.set("id", "corpus");
      /* Upgrade to version 1.38 */
      if(this.get("corpusId")){
        var corpusid = this.get("corpusid")
        this.set("corpusid", corpusid);
        this.unset("corpusId");
      }
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      //TODO use these states to show what is public and what is not.
      if(!this.get("datumStates")){
        this.set("datumStates", new DatumStates());
      }//end if to set datumStates

      //Keeping all items since this seems okay for public viewing/searching if the user wants to let the public see it.
      if(!this.get("datumFields")){
        this.set("datumFields", new DatumFields(
            [
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
                                               ]
            ));
      }//end if to set datumFields

      //Removed goal and consultants by default, keeping language and dialect since these seem okay to make public
      if(!this.get("sessionFields")){
        this.set("sessionFields", new DatumFields([
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

      if (!this.permissions) {
        this.permissions = new Permissions();
      }
    },
    /**
     * backbone-couchdb adaptor set up
     */

    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/corpuses",

    defaults : {
      title : "Private Corpus",
      titleAsUrl :"PrivateCorpus",
      description : "The details of this corpus are not public.",
//      consultants : Consultants,
//      datumStates : DatumStates,
//      datumFields : DatumFields,
//      sessionFields : DatumFields,
//      searchFields : DatumFields,
//      couchConnection : JSON.parse(localStorage.getItem("mostRecentCouchConnection")) || OPrime.defaultCouchConnection()
    },
    loadPermissions: function(){
      //TODO decide if we need this method in a corpus mask
    },
    /**
     * this resets the titleAsUrl to match the title, this means if the usr changes the title, their corpu has high chances of not being unique.
     *
     * @param key
     * @param value
     * @param options
     * @returns
     */
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
    // Internal models: used by the parse function
    internalModels : {
      //removed confidential because we dont want the token to end up in a corpusmask, if it does, then the corpusmask wont be able to parse anyway.
      consultants : Consultants,
      datumStates : DatumStates,
      datumFields : DatumFields,
      sessionFields : DatumFields,
      searchFields : DatumFields,
//      sessions : Sessions,
//      dataLists : DataLists,
      permissions : Permissions,
      comments: Comments
    },
//    glosser: new Glosser(),//DONOT store in attributes when saving to pouch (too big)
    lexicon: new Lexicon(),//DONOT store in attributes when saving to pouch (too big)
    /**
     * this function makes it possible to save the CorpusMask with a
     * hardcoded id, it uses pouch's API directly
     *
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      if (OPrime.debugMode) OPrime.debug("Saving the CorpusMask");
      var self = this;
      self.set("id","corpus");
      self.set("_id","corpus");
      this.set("timestamp", Date.now());
      if(window.app && window.app.get("corpus") && window.app.get("corpus").get("termsOfUse")){
        this.set("termsOfUse", window.app.get("corpus").get("termsOfUse"));
      }
      if(window.app && window.app.get("corpus") && window.app.get("corpus").get("license")){
        this.set("license", window.app.get("corpus").get("license"));
      }
      if(window.app && window.app.get("corpus") && window.app.get("corpus").get("copyright")){
        this.set("copyright", window.app.get("corpus").get("copyright"));
      }

        if(OPrime.isBackboneCouchDBApp()){
          self.save();
          if(typeof successcallback == "function"){
            successcallback();
          }
          return;
        }
        self.pouch(function(err,db){
          var modelwithhardcodedid = self.toJSON();
          modelwithhardcodedid._id = "corpus";
          db.put(modelwithhardcodedid, function(err, response) {
            if (OPrime.debugMode) OPrime.debug(response);
            if(err){
              if (OPrime.debugMode) OPrime.debug("CorpusMask put error", err);
              if(err.status == "409"){
                //find out what the rev is in the database by fetching
                self.fetch({
                  success : function(model, response) {
                    if (OPrime.debugMode) OPrime.debug("CorpusMask fetch revision number success, after getting a Document update conflict", response);

                    modelwithhardcodedid._rev = self.get("_rev");
                    if (OPrime.debugMode) OPrime.debug("CorpusMask old version", self.toJSON());
                    if (OPrime.debugMode) OPrime.debug("CorpusMask replaced with new version", modelwithhardcodedid );

                    db.put(modelwithhardcodedid, function(err, response) {
                      if(err){
                        if (OPrime.debugMode) OPrime.debug("CorpusMask put error, even after fetching the version number",err);
                        if(typeof failurecallback == "function"){
                          failurecallback();
                        }
                      }else{
                        if (OPrime.debugMode) OPrime.debug("CorpusMask put success, after fetching its version number and overwriting it", response);
                        //this happens on subsequent save into pouch of this CorpusMask's id
                        if(typeof successcallback == "function"){
                          successcallback();
                        }
                      }
                    });

                  },
                  //fetch error
                  error : function(e) {
                    if (OPrime.debugMode) OPrime.debug('CorpusMask fetch error after trying to resolve a conflict error' + JSON.stringify(err));
                    if(typeof failurecallback == "function"){
                      failurecallback();
                    }
                  }
                });
              }else{
                if (OPrime.debugMode) OPrime.debug('CorpusMask put error that was not a conflict' + JSON.stringify(err));
                //this is a real error, not a conflict error
                if(typeof failurecallback == "function"){
                  failurecallback();
                }
              }
            }else{
              if(typeof successcallback == "function"){
                successcallback();
              }else{
                if (OPrime.debugMode) OPrime.debug("CorpusMask save success", response);
              }
            }
          });
      });
    },
    /**
     * this function makes it possible to save the CorpusMask with a
     * hardcoded id, it uses pouch's API directly
     */
    updateToPouch : function(){
      alert("Bug: the corpusmask updatetopouch method is deprecated please report this!");

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
      // Glosser.downloadPrecedenceRules(pouchname, callback);
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
      // this.lexicon.buildLexiconFromCouch(pouchname,callback);
    }
  });

  return CorpusMask;
});
