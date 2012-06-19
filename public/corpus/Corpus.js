define([ 
    "use!backbone",
    "confidentiality_encryption/Confidential", 
//    "user/Informants", 
    "datum/DatumState",
    "datum/DatumStates",
//    "datum/DatumFields,"
    "datum/Sessions",
    "data_list/DataLists",
    "permission/Permissions",
    "libs/Utils"
], function(
    Backbone, 
    Confidential, 
//    Informants, 
    DatumState,
    DatumStates,
//    DatumFields, 
    Sessions, 
    DataLists, 
    Permissions
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
       * @property {Informants} informants Collection of informants who contributed to the corpus
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
        // http://www.joezimjs.com/javascript/introduction-to-backbone-js-part-5-ajax-video-tutorial/
        this.on('all', function(e) {
          Utils.debug(this.get('title') + " event: " + JSON.stringify(e));
        }); 

        this.set("datumStates", new DatumStates([ 
          new DatumState()
          ,new DatumState({
            state : "To be checked",
            color : "warning"
          })
          , new DatumState({
            state : "Deleted",
            color : "important"
          }) 
        ]));

      },
      
      defaults : {
        title : "",
        titleAsUrl :"",
        description : "",
        confidential :  Confidential,
//        informants : Informants,
        datumStates : DatumStates,
//        datumFields : DatumFields, 
        sessions : Sessions, 
        datalists : DataLists, //TODO capitalize L?
        permissions : Permissions
        
      },
      pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl
          : Utils.pouchUrl),
          
      validate: function(attrs){
//        console.log(attrs);
//        if(attrs.title != undefined){
//          this.set("titleAsUrl",encodeURIComponent(attrs.title)); //TODO the validate on corpus was not working.
//        }
      }

    });
    
  return Corpus;
});
