define([ 
    "backbone",
    "activity/Activity",
    "comment/Comment",
    "comment/Comments",
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
    "datum/Sessions",
    "user/User",
    "glosser/Glosser",
    "libs/Utils"
], function(
    Backbone, 
    Activity,
    Comment, 
    Comments,
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
    Sessions,
    User
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

      //Hard code this corpus' id so that it will be findable without an id if one knows the corpus name
      this.id = "corpus";
      
      //TODO use these states to show what is public and what is not.
      if(typeof(this.get("datumStates")) == "function"){
        this.set("datumStates", new DatumStates([ 
          new DatumState()
        ]));
      }//end if to set datumStates
      
      //Keeping all items since this seems okay for public viewing if the user wants to let the public see it. 
      if(typeof(this.get("datumFields")) == "function"){
        this.set("datumFields", new DatumFields([ 
          new DatumField({
            label : "judgement",
            size : "3",
            encrypted: "",
            userchooseable: "disabled",
            help: "Use this field to establish your team's gramaticality/acceptablity judgements (*,#,? etc)"
          }),
          new DatumField({
            label : "utterance",
            encrypted: "checked",
            userchooseable: "disabled",
            help: "Use this as Line 1 in your examples for handouts (ie, either Orthography, or phonemic/phonetic representation)"
          }),
          new DatumField({
            label : "morphemes",
            encrypted: "checked",
            userchooseable: "disabled",
            help: "This line is used to determine the morpheme segmentation to generate glosses, it also optionally can show up in your LaTeXed examples if you choose to show morpheme segmentation in addtion ot line 1, gloss and translation."
          }),
          new DatumField({
            label : "gloss",
            encrypted: "checked",
            userchooseable: "disabled",
            help: "This line appears in the gloss line of your LaTeXed examples, we reccomend Leipzig conventions (. for fusional morphemes, - for morpehem boundaries etc) The system uses this line to partially help you in glossing. "
          }),
          new DatumField({
            label : "translation",
            encrypted: "checked",
            userchooseable: "disabled",
            help: "Use this as your primary translation. It does not need to be English, simply a language your team is comfortable with. If your consultant often gives you multiple languages for translation you can also add addtional translations in the customized fields. For example, your Quechua informants use Spanish for translations, then you can make all Translations in Spanish, and add an additional field for English if you want to generate a handout containing the datum. "
          })
        ]));
      }//end if to set datumFields
      
      //Removed goal and consultants by default, keeping language and dialect since these seem okay to make public
      if(typeof(this.get("sessionFields")) == "function"){
        this.set("sessionFields", new DatumFields([ 
          new DatumField({
            label : "dialect",
            encrypted: "",
            userchooseable: "disabled",
            help: "You can use this field to be as precise as you would like about the dialect of this session."
          }),
          new DatumField({
            label : "language",
            encrypted: "",
            userchooseable: "disabled",
            help: "This is the langauge (or language family) if you would like to use it."
          }),
          new DatumField({
            label : "dateElicited",
            encrypted: "",
            userchooseable: "disabled",
            help: "This is the date in which the session took place."
          }),
          new DatumField({
            label : "user",
            encrypted: "",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "dateSEntered",
            encrypted: "",
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
      
      if (!this.get("permissions")) {
        this.set("permissions", new Permissions());
      }
      
    },
    
    defaults : {
      title : "Private Corpus",
      titleAsUrl :"PrivateCorpus",
      description : "The details of this corpus are not public.",
      consultants : Consultants,
      datumStates : DatumStates,
      datumFields : DatumFields, 
      sessionFields : DatumFields,
      searchFields : DatumFields,
      couchConnection : JSON.parse(localStorage.getItem("mostRecentCouchConnection")) || Utils.defaultCouchConnection()
    },
    
    // Internal models: used by the parse function
    model : {
      //removed confidential because we dont want the token to end up in a corpusmask, if it does, then the corpusmask wont be able to parse anyway.
      consultants : Consultants,
      datumStates : DatumStates,
      datumFields : DatumFields, 
      sessionFields : DatumFields,
      searchFields : DatumFields,
      sessions : Sessions, 
      dataLists : DataLists, 
      permissions : Permissions,
      comments: Comments
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
    updateToPouch : function(){
      var self = this;
      this.changeCorpus(null, function(){
        self.save(null, {
          success : function(model, response) {
            //we got the model back, now lets put it into pouch with the hard coded id.
            model._id = "corpus";
            self.pouch(function(err,db){
              db.put(model.toJSON(), function(err, response) {
               console.log(response);
              });
            });
          },
          error : function(e) {
          }
        });
      });
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
    }
  });
    
  return CorpusMask;
});
