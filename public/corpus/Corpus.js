define([ 
    "use!backbone",
    "confidentiality_encryption/Confidential",
    "libs/Utils"
], function(
    Backbone, 
    Confidential
) {
  var Corpus = Backbone.Model.extend(
    /** @lends Corpus.prototype */
    {
      /**
       * @class A corpus is like a git repository, it has a remote, a name
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
       * @property {String} name This is used to refer to the corpus, and
       *           what appears in the url on the main website eg
       *           http://fieldlinguist.com/Sapir/SampleFieldLinguisticsCorpus
       * @property {String} description This is a short description that
       *           appears on the corpus details page
       * @property {String} remote The git url of the remote eg:
       *           git@fieldlinguist.com:Sapir/SampleFieldLinguisticsCorpus.git
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
          Utils.debug(this.get('name') + " event: " + JSON.stringify(e));
        }); 
      },
      
      defaults : {
        name : "",
        description : "",
        confidential :  Confidential
      }

    });
    
  return Corpus;
});
