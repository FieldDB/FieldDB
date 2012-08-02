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
      
      /* Menu */
      "click .LaTeX" : function(){
        this.model.laTeXiT(true);
        $("#export-modal").modal("show");
      },
      "click .icon-paste" : function(){
        this.model.exportAsPlainText(true);
        $("#export-modal").modal("show");
      },
      "click .CSV" : function(){
        this.model.exportAsCSV(true, null, true);
        $("#export-modal").modal("show");
      },
      "click .icon-th-list" : "hideRareFields",
      "click .icon-list-alt" : "showRareFields",
      
      
      /* Read Only Menu */
      "dblclick" : function(e) {
        if(e){
          e.stopPropagation();
        }
        // Prepend Datum to the top of the DatumContainer stack
        var d = this.model.clone();
        d.id = this.model.id;
        d.set("_id", this.model.get("_id"));
        d.set("_rev", this.model.get("_rev"));
        appView.datumsEditView.prependDatum(d);
      },
      "click .datum-checkboxes": function(e){
        if(e){
          e.stopPropagation();
        }
    //    alert("Checked box " + this.model.id);
        this.checked = e.target.checked;
      }
    },

    /**
     * The Handlebars template rendered as the DatumReadView.
     */
    template : Handlebars.templates.datum_read_embedded,
    
    /**
     * The Handlebars template rendered as the DatumLatexView.
     */
    latexTemplate : Handlebars.templates.datum_read_latex,

    /**
     * Renders the DatumReadView and all of its partials.
     */
    render : function() {
      Utils.debug("DATUM READ render: " + this.model.get("datumFields").models[1].get("mask") );
      
      if(this.model.get("datumFields").where({label: "utterance"})[0] == undefined){
        Utils.debug("DATUM fields is undefined, come back later.");
        return this;
      }
      var jsonToRender = this.model.toJSON();
      jsonToRender.datumStates = this.model.get("datumStates").toJSON();
      jsonToRender.decryptedMode = window.app.get("corpus").get("confidential").decryptedMode;

      if (this.format == "well") {        
        // Display the DatumReadView
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
        //This gets the fields necessary from the model
        var judgement = this.model.get("datumFields").where({label: "judgement"})[0].get("mask");
        var utterance = this.model.get("datumFields").where({label: "utterance"})[0].get("mask");
        var gloss = this.model.get("datumFields").where({label: "gloss"})[0].get("mask");
        var translation = this.model.get("datumFields").where({label: "translation"})[0].get("mask");
        
        // makes the top two lines into an array of words.
        var utteranceArray = utterance.split(' ');
        var glossArray = gloss.split(' ');
        
        // Form an array of utterance and gloss segments for rendering
        var couplet = [];
        for (var i = 0; i < utteranceArray.length; i++) {
          couplet.push({
            utteranceSegment : utteranceArray[i],
            glossSegment : glossArray[i]
          });
        }
        
        var jsonToRender = {};
        jsonToRender.translation = translation;
        jsonToRender.couplet = couplet;
        if (judgement !== "") {
          jsonToRender.judgement = judgement;
        }
        
        $(this.el).html(this.latexTemplate(jsonToRender));
      }
      
      //localization
//      $(".locale_Add").html(chrome.i18n.getMessage("locale_Add"));
//      $(".locale_Add_Tag").attr("placeholder", chrome.i18n.getMessage("locale_Add_Tag"));
//      $(".locale_Add_Tags").attr("title", chrome.i18n.getMessage("locale_Add_Tag"));
//      $(".locale_Play_Audio").attr("title", chrome.i18n.getMessage("locale_Play_Audio"));
//      $(".locale_Copy").attr("title", chrome.i18n.getMessage("locale_Copy"));
//      $(".locale_Duplicate").attr("title", chrome.i18n.getMessage("locale_Duplicate"));
//      $(".locale_Encrypt").attr("title", chrome.i18n.getMessage("locale_Encrypt"));
      
      return this;
    },
    
    renderState : function() {
      if (this.stausview != undefined) {
        this.stateView.render();
      }
    },
    rareFields : [],
    frequentFields: ["judgement","utterance","morphemes","gloss","translation"],
    hideRareFields : function(){
      this.rareFields = [];
      for(var f = 0; f < this.model.get("datumFields").length; f++ ){
        if( this.frequentFields.indexOf( this.model.get("datumFields").models[f].get("label") ) == -1 ){
          $(this.el).find("."+this.model.get("datumFields").models[f].get("label")).hide();
          this.rareFields.push(this.model.get("datumFields").models[f].get("label"));
        }
      }
      $(this.el).find(".icon-th-list").addClass("icon-list-alt");
      $(this.el).find(".icon-th-list").removeClass("icon-th-list");
      $(this.el).find(".comments-section").hide();

    },
    
    showRareFields : function(){
      for(var f = 0; f < this.model.get("datumFields").length; f++ ){
        $(this.el).find("."+this.model.get("datumFields").models[f].get("label")).show();
      }
      rareFields = [];
      $(this.el).find(".icon-list-alt").addClass("icon-th-list");
      $(this.el).find(".icon-list-alt").removeClass("icon-list-alt");
      $(this.el).find(".comments-section").show();

    },
    
    /**
     * Encrypts the datum if it is confidential
     * 
     */
    encryptDatum : function() {
      this.model.encrypt();
      this.render();
      $(".icon-unlock").toggleClass("icon-unlock icon-lock");
    },

    /**
     * Decrypts the datum if it was encrypted
     */
    decryptDatum : function() {
      this.model.decrypt();
      this.render();
      $(".icon-lock").toggleClass("icon-unlock icon-lock");
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
//    }, 
//    
//    showButtonHelp : function(){
//      this.$(".button-help").tooltip("show");
    }
  });

  return DatumReadView;
});
