// TODO Make this a read-only version. Right now, this is just a copy of the Editable version

define([
    "use!backbone", 
    "use!handlebars", 
    "text!datum/datum_read_embedded.handlebars",
    "audio_video/AudioVideoEditView",
    "confidentiality_encryption/Confidential",
    "datum/Datum",
    "datum/DatumFieldReadView",
    "datum/DatumStateReadView",
    "datum/DatumTag",
    "datum/DatumTagReadView",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    datumTemplate, 
    AudioVideoEditView,
    Confidential,
    Datum,
    DatumFieldReadView,
    DatumStateReadView,
    DatumTag,
    DatumTagReadView,
    UpdatingCollectionView
) {
  var DatumReadView = Backbone.View.extend(
  /** @lends DatumReadView.prototype */
  {
    /**
     * @class The layout of a single Datum. It contains a datum state,
     *        datumFields, datumTags and a datum menu.
     * 
     * @property {String} format Value formats are "latex", "leftSide", or "centreWell".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      // Create a AudioVideoEditView
      this.AudioVideoEditView = new AudioVideoEditView({
        model : this.model.get("audioVideo"),
      });
      
      // Create a DatumStateReadView
      this.stateView = new DatumStateReadView({
        model : this.model.get("state"),
      });
      this.stateView.format = "datum";
      
      // Create a DatumTagView
      this.datumTagsView = new UpdatingCollectionView({
        collection           : this.model.get("datumTags"),
        childViewConstructor : DatumTagReadView,
        childViewTagName     : "li",
      }),

      // Create the DatumFieldsView
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldReadView,
        childViewTagName     : "li",
        childViewFormat      : "datum"
      });
    },

    /**
     * The underlying model of the DatumReadView is a Datum.
     */
    model : Datum,

    /**
     * The AudioVideoEditView is not a partial of the DatumReadView, it must be called to render it.
     */
    AudioVideoEditView : AudioVideoEditView,

    /**
     * The stateView is a partial of the DatumReadView.
     */
    stateView : DatumStateReadView,

    /**
     * The tagview is a partial of the DatumReadView.
     */
    datumTagsView : UpdatingCollectionView,

    /**
     * The datumFieldsView displays the all the DatumFieldEditViews.
     */
    datumFieldsView : UpdatingCollectionView,
    
    /**
     * Events that the DatumReadView is listening to and their handlers.
     */
    events : {
      "click .icon-lock" : "encryptDatum",
      "click .icon-unlock" : "decryptDatum",
      "click .datum_state_select" : "renderState",
      "click #clipboard" : "copyDatum"
    },

    /**
     * The Handlebars template rendered as the DatumReadView.
     */
    template : Handlebars.compile(datumTemplate),

    /**
     * Renders the DatumReadView and all of its partials.
     */
    render : function() {
      Utils.debug("DATUM render: " + this.el);
      
      if (this.format == "centreWell") {
        if (this.model != undefined) {        
          // Display the DatumReadView
          this.setElement($("#datum-embedded"));
          $(this.el).html(this.template(this.model.toJSON()));
          
          // Display StateView
          this.datumStateView.el = this.$(".datum_state_edit");
          this.datumStateView.render();
          
          // Display audioVideo View
          this.audioVideoEditView.el = this.$(".audio_video");
          this.audioVideoEditView.render();
          
          // Display the DatumTagsView
          this.datumTagsView.el = this.$(".datum_tags_ul")
          this.datumTagsView.render();
          
          // Display the DatumFieldsView
          this.datumFieldsView.el = this.$(".datum_fields_ul");
          this.datumFieldsView.render();
        } else {
          Utils.debug("\tDatum model was undefined");
        }
      } else if (this.format == "latex") {
        translation: this.model.get("datumFields").where({label: "translation"})[0].get("value"),      
        utterance= this.model.get("datumFields").where({label: "utterance"})[0].get("value");
        gloss = this.model.get("datumFields").where({label: "gloss"})[0].get("value");
        translation= this.model.get("datumFields").where({label: "translation"})[0].get("value"),
  
        utteranceArray = utterance.split(' ');
        glossArray = gloss.split(' ');
        
        glossCouplet = [];
        var i= 0;
        for( i; i<utteranceArray.length; i++){
          glossCouplet = utteranceArray[i] +"<br>"+ glossArray[i];
          this.$el.append('<span class ="glossCouplet">'+ glossCouplet + '</span>');
        };
        this.$el.append('<br>'+translation);
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
    }
  });

  return DatumReadView;
});
