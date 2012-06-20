define([ 
    "use!backbone",
    "confidentiality_encryption/Confidential", 
    "data_list/DataLists",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumState",
    "datum/DatumStates",
//  "user/Informants",
    "permission/Permissions",
    "datum/Sessions",
    "libs/Utils"
], function(
    Backbone, 
    Confidential, 
    DataLists,
    DatumField,
    DatumFields, 
    DatumState,
    DatumStates,
//  Informants,
    Permissions,
    Sessions
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

        if(typeof(this.get("datumStates")) == "function"){
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
        }//end if to set datumStates
        
        if(typeof(this.get("datumFields")) == "function"){
          this.set("datumFields", new DatumFields([ 
            new DatumField({
              label : "judgement",
              size : "3",
              encrypted: "",
              userchosen: "disabled",
              help: "Use this field to establish your team's gramaticality/acceptablity judgements (*,#,? etc)"
            }),
            new DatumField({
              label : "utterence",
              encrypted: "checked",
              userchosen: "disabled",
              help: "Use this as Line 1 in your examples for handouts (ie, either Orthography, or phonemic/phonetic representation)"
            }),
            new DatumField({
              label : "morphemes",
              encrypted: "checked",
              userchosen: "disabled",
              help: "This line is used to determine the morpheme segmentation to generate glosses, it also optionally can show up in your LaTeXed examples if you choose to show morpheme segmentation in addtion ot line 1, gloss and translation."
            }),
            new DatumField({
              label : "gloss",
              encrypted: "checked",
              userchosen: "disabled",
              help: "This line appears in the gloss line of your LaTeXed examples, we reccomend Leipzig conventions (. for fusional morphemes, - for morpehem boundaries etc) The system uses this line to partially help you in glossing. "
            }),
            new DatumField({
              label : "translation",
              encrypted: "checked",
              userchosen: "disabled",
              help: "Use this as your primary translation. It does not need to be English, simply a language your team is comfortable with. If your consultant often gives you multiple languages for translation you can also add addtional translations in the customized fields. For example, your Quechua informants use Spanish for translations, then you can make all Translations in Spanish, and add an additional field for English if you want to generate a handout containing the datum. "
            })
          ]));
        }//end if to set datumFields
      },
      
      defaults : {
        title : "",
        titleAsUrl :"",
        description : "",
        confidential :  Confidential,
// informants : Informants,
        datumStates : DatumStates,
        datumFields : DatumFields, 
        sessions : Sessions, 
        datalists : DataLists, // TODO capitalize L?
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
