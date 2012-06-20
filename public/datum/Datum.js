define([ "use!backbone",
         "audio_video/AudioVideo", 
         "comment/Comments",
         "datum/DatumField", 
         "datum/DatumState", 
         "datum/DatumTags", 
         "datum/Session",
         "libs/Utils"
], function(Backbone, 
    AudioVideo, 
    Comments,
    DatumField, 
    DatumState, 
    DatumTags,
    Session) {
  var Datum = Backbone.Model.extend(
  /** @lends Datum.prototype */
  {
    /**
     * @class The Datum widget is the place where all linguistic data is
     *        entered; one at a time.
     * 
     * @property {DatumField} utterance The utterance field generally
     *           corresponds to the first line in linguistic examples that can
     *           either be written in the language's orthography or a
     *           romanization of the language. An additional field can be added
     *           if the language has a non-roman script.
     * @property {DatumField} gloss The gloss field corresponds to the gloss
     *           line in linguistic examples where the morphological details of
     *           the words are displayed.
     * @property {DatumField} translation The translation field corresponds to
     *           the third line in linguistic examples where in general an
     *           English translation. An additional field can be added if
     *           translations into other languages is needed.
     * @property {DatumField} judgment The judgment is the grammaticality
     *           judgment associated with the datum, so grammatical,
     *           ungrammatical, felicitous, unfelicitous etc.
     * @property {DatumState} state When a datum is created, it can be tagged
     *           with a state, such as 'to be checked with an informant'.
     * @property {AudioVisual} audioVisual Datums can be associated with an audio or video
     *           file.
     * @property {Session} session The session provides details about the set of
     *           data elicited. The session will contain details such as date,
     *           language, informant etc.
     * @property {Comments} comments The comments is a collection of comments
     *           associated with the datum, this is meant for comments like on a
     *           blog, not necessarily notes, which can be encoded in a
     *           field.(Use Case: team discussing a particular datum)
     * @property {DatumTags} datumtags The datum tags are a collection of tags
     *           associated with the datum. These are made completely by the
     *           user.They are like blog tags, a way for the user to make
     *           categories without make a hierarchical structure, and make
     *           datum easier for search.
     * 
     * 
     * 
     * @description The initialize function brings up the datum widget in small
     *              view with one set of datum fields. However, the datum widget
     *              can contain more than datum field set and can also be viewed
     *              in full screen mode.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      if(typeof this.get("audioVideo") == "function"){
        this.set("audioVideo",new AudioVideo());
      }
      
    },

    defaults : {
      // here are the attributes a datum minimally has to have, other fields can
      // be added within the datum widget.
      judgement : DatumField,
      utterence : DatumField,
      morphemes : DatumField,
      gloss : DatumField,
      translation : DatumField,
      
      audioVideo : AudioVideo,
      session : Session,
      comments : Comments,
      datumState : DatumState,
      datumTags : DatumTags,
      dateEntered : DatumField

    },

    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl
        : Utils.pouchUrl),

    /**
     * The LaTeXiT function automatically mark-ups an example in LaTeX code
     * (\exg. \"a) and then copies it on the clipboard so that when the user
     * switches over to their LaTeX file they only need to paste it in.
     */
    laTeXiT : function() {
      return "";
    },

    /**
     * The addAudio function is a drop box in which the user can drag an audio
     * file and link it to the relevant datum.
     */
    addAudio : function() {
      return true;
    },

    /**
     * The playDatum function appears when the audio has already been added and
     * allows the user to play the associated audio file.
     */
    playDatum : function() {
      return true;
    },

    /**
     * The copyDatum function copies all datum fields to the clipboard.
     */
    copyDatum : function() {
      return "";
    },

    /**
     * The duplicateDatum function opens a new datum field set with the fields
     * already filled exactly like the previous datum so that the user can
     * minimally edit the datum.
     */
    duplicateDatum : function() {
//      var datum = new Datum();
      return datum;
    }
  });

  return Datum;
});
