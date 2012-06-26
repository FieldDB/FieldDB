define([
    "use!backbone", 
    "use!handlebars", 
    "text!datum/datum.handlebars",
    "audio_video/AudioVideoView",
    "confidentiality_encryption/Confidential",
    "datum/Datum",
    "datum/DatumFieldValueEditView",
    "datum/DatumStateView",
    "datum/DatumTagsView",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    datumTemplate, 
    AudioVideoView,
    Confidential,
    Datum,
    DatumFieldValueEditView,
    DatumStateView,
    DatumTagsView,
    UpdatingCollectionView
) {
  var DatumView = Backbone.View.extend(
  /** @lends DatumView.prototype */
  {
    /**
     * @class The layout of a single Datum. It contains a datum state,
     *        datumFields, datumTags and a datum menu.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      // Create a AudioVideoView
      this.audioVideoView = new AudioVideoView({
        model : this.model.get("audioVideo"),
      });
      
      // Create a DatumStateView
      this.stateView = new DatumStateView({
        model : this.model.get("state"),
      });
      
      // Create a DatumTagView
      this.tagsview = new DatumTagsView({
        model : this.model.get("datumTag"),
      });

      // Create the DatumFieldsView
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldValueEditView,
        childViewTagName     : "li",
      });
    },

    /**
     * The underlying model of the DatumView is a Datum.
     */
    model : Datum,

    /**
     * The audioVideoView is not a partial of the DatumView, it must be called to render it.
     */
    audioVideoView : AudioVideoView,

    /**
     * The stateView is a partial of the DatumView.
     */
    stateView : DatumStateView,

    /**
     * The tagview is a partial of the DatumView.
     */
    tagsview : DatumTagsView,

    /**
     * The datumFieldsView displays the all the DatumFieldValueEditViews.
     */
    datumFieldsView : UpdatingCollectionView,
    
    /**
     * Events that the DatumView is listening to and their handlers.
     */
    events : {
      "click #new" : "newDatum",
      "click .icon-lock" : "encryptDatum",
      "click .icon-unlock" : "decryptDatum",
      "click .datum_state_select" : "renderState",
      "click #clipboard" : "copyDatum",
      "change" : "updatePouch",
    },

    /**
     * The Handlebars template rendered as the DatumView.
     */
    template : Handlebars.compile(datumTemplate),

    /**
     * Renders the DatumView and all of its partials.
     */
    render : function() {
      Utils.debug("DATUM render: " + this.el);
      
      if (this.model != undefined) {        
        // Display the DatumView
        this.setElement($("#datum-view"));
        $(this.el).html(this.template(this.model.toJSON()));
        
        // Display StateView
        this.stateView.render();
        
        // Display audioVideo View
        this.audioVideoView.render();
        
        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$(".datum_fields_ul");
        this.datumFieldsView.render();
      } else {
        Utils.debug("\tDatum model was undefined");      
      }

      return this;
    },
    
    renderState : function() {
      if (this.stausview != undefined) {
        this.stateView.render();
      }
    },
    
    /**
     * Encrypts the datum if it is confidential
     * 
     * @returns {Boolean}
     */
    encryptDatum : function() {
      // TODO Redo to make it loop through the this.model.get("datumFields")
      // console.log("Fake encrypting");
      var confidential = appView.corpusView.model.confidential;

      if (confidential == undefined) {
        appView.corpusView.model.confidential = new Confidential();
        confidential = appView.corpusView.model.confidential;
      }

      this.model.set("utterance", confidential.encrypt(this.model
          .get("utterance")));
      this.model.set("morphemes", confidential.encrypt(this.model
          .get("morphemes")));
      this.model.set("gloss", confidential.encrypt(this.model.get("gloss")));
      this.model.set("translation", confidential.encrypt(this.model
          .get("translation")));

      // this.model.set("utterance", this.model.get("utterance").replace(/[^
      // -.]/g,"x"));
      // this.model.set("morphemes", this.model.get("morphemes").replace(/[^
      // -.]/g,"x"));
      // this.model.set("gloss", this.model.get("gloss").replace(/[^
      // -.]/g,"x"));
      // this.model.set("translation", this.model.get("translation").replace(/[^
      // -.]/g,"x"));
      this.render();
      $(".icon-lock").toggleClass("icon-lock icon-unlock");

      // console.log(confidential);
      // this.model.set()
    },
    
    /**
     * Decrypts the datum if it was encrypted
     */
    decryptDatum : function() {
      // TODO Redo to make it loop through the this.model.get("datumFields")
      var confidential = appView.corpusView.model.confidential;
      this.model.set("utterance", confidential.decrypt(this.model
          .get("utterance")));
      this.model.set("morphemes", confidential.decrypt(this.model
          .get("morphemes")));
      this.model.set("gloss", confidential.decrypt(this.model.get("gloss")));
      this.model.set("translation", confidential.decrypt(this.model
          .get("translation")));
      this.render();
      $(".icon-lock").toggleClass("icon-lock icon-unlock");
    },
    
    newDatum : function() {
      /*
       * First, we build a new datum model, this datum model then asks if it
       * belongs to a session if it belongs to a session it goes ahead and
       * renders a new datum if it does not belong to a session, it builds a new
       * session and renders a new session view. after the new session is sent
       * to pouch, then a new datumview can be rendered.
       */

      // var newDatum = new DatumView({model: new Datum()});
      // $("#fullscreen-datum-view").append(newDatum.render().el);
      // var sID = this.newDatum.get("sessionID");
      // console.log(sID);
      //      	
      // if(newDatum.sessionID == 0){
      // var newSession = new SessionView({model: new Session()});
      // $("#new-session-view").append(newSession.render().el);
      //
      // }
      Utils.debug("I'm a new datum!");
      return true;
    },
    
    needsSave : false,
    
    updatePouch : function() {
      this.needsSave = true;
    },

    /**
     * If the model needs to be saved, saves it.
     */
    saveScreen : function() {
      if (this.needsSave) {
        // Change the needsSave flag before saving just in case another change
        // happens
        // before the saving is done
        this.needsSave = false;

        Utils.debug("Saving the Datum");
        this.model.save();
      }
    },
    //Functions relating to the row of icon-buttons
    /**
     * The LaTeXiT function automatically mark-ups an example in LaTeX code
     * (\exg. \"a) and then copies it on the clipboard so that when the user
     * switches over to their LaTeX file they only need to paste it in.
     */
    laTeXiT : function() {
      return "";
    },
    /**
     * The copyDatum function copies all datum fields to the clipboard.
     */
    copyDatum : function() {
      
      var text = $(".datum_field_input").val() || [];
     // $(".datum_fields_ul")[0].focus();
    //  $(".datum_fields_ul")[0].select();
      console.log(text);
      
 
      
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

  return DatumView;
});
