define([
    "backbone", 
    "handlebars", 
    "confidentiality_encryption/Confidential",
    "datum/Datum",
    "datum/DatumFieldReadView",
    "datum/DatumStateReadView",
    "datum/DatumTagReadView",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    Confidential,
    Datum,
    DatumFieldReadView,
    DatumStateReadView,
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
    template : Handlebars.templates.datum_read_embedded,

    /**
     * Renders the DatumReadView and all of its partials.
     */
    render : function() {
      Utils.debug("DATUM render: " + this.el);
      
      if(this.model.get("datumFields").where({label: "utterance"})[0] == undefined){
        Utils.debug("DATUM fields is undefined, come back later.");
        return this;
      }
      if (this.format == "well") {        
        // Display the DatumReadView
        var jsonToRender = this.model.toJSON();
        jsonToRender.datumStates = this.model.get("datumStates").toJSON();
        $(this.el).html(this.template(jsonToRender));
        
        // Display the DatumTagsView
        this.datumTagsView.el = this.$(".datum_tags_ul");
        this.datumTagsView.render();
        
        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$(".datum_fields_ul");
        this.datumFieldsView.render();
        // This bit of code makes the datum look like its rendered by
        // latex, could be put into a function, but not sure if thats
        // necessary...
      } else if (this.format == "latex") {
        // Clear the el
        this.$el.empty();
        
        //This gets the fields necessary from the model
        judgement= this.model.get("datumFields").where({label: "judgement"})[0].get("value");

        utterance= this.model.get("datumFields").where({label: "utterance"})[0].get("value");
        gloss = this.model.get("datumFields").where({label: "gloss"})[0].get("value");
        translation= this.model.get("datumFields").where({label: "translation"})[0].get("value");
        
        //makes the top two lines into an array of words.
        utteranceArray = utterance.split(' ');
        glossArray = gloss.split(' ');
        
        //for loop aligns each word in the utterance with a word in the  gloss
        glossCouplet = [];
        var i = 0;
        for (i; i < utteranceArray.length; i++) {
          glossCouplet = utteranceArray[i] +"<br>"+ glossArray[i];
          this.$el.append('<span class ="glossCouplet">'+ glossCouplet + '</span>');
        };
        if(judgement !== ""){
        this.$el.prepend('&nbsp <span class = "latex-judgement">'+judgement+'</span> &nbsp');
        }
        //adding a checkbox
        this.$el.prepend('<input type="checkbox" class="styled datum-checkboxes"/> &nbsp &nbsp');
        //adding the translation on the final line.
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
