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
       * @property {String} localFolder The local url of the corpus on
       *           android/node eg: Sapir/SampleFieldLinguisticsCorpus
       * @property {Array} changedDatumList This array contains a list of
       *           the datum that have been changed and need to be synced
       * @property {Array} originalImportFiles This array contains a list
       *           of the original source files which will be put into
       *           version control with the corpus. This is used so that
       *           the user can go back to their original files:eg
       *           sample_elan.eaf
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
        changedDatumList : [],
        confidential :  Confidential
      }
      
//        ,
//        insertDatum : function(datum) {
//          Utils.debug("Getting this datum's id from the corpus, and adding it to the list of changed datum that must be synced. "
//              + JSON.stringify(datum));
//          datum.id = this.autoincrement;
//          this.changedDatumList.push(datum);
//          this.autoincrement++;
//        },
//        updateDatum : function(datum) {
//          Utils.debug("Telling the corpus that this datum has changed "
//              + JSON.stringify(datum));
//          this.changedDatumList.push(datum);
//        },
//        push : function() {
//          Utils.debug("Attempting to connect to the internet, contacting remote and sending changed datum list");
//        },
//        pull : function() {
//          Utils.debug("Attempting to connect to the internet, contacting remote and pulling down the files which have changed.");
//        },
//        merge : function() {
//          Utils.debug("The user has clicked okay, the newer version of the corpus will be saved locally, or the user's branch will be merged remotely.");
//        },
//        diff : function() {
//          Utils.debug("Showing the user the diffs between their version of the corpus and the remote version.");
//        },
    });
    
  return Corpus;
});
