define([
    "backbone", 
    "handlebars", 
    "activity/Activity",
    "audio_video/AudioVideoEditView",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "confidentiality_encryption/Confidential",
    "datum/Datum",
    "datum/DatumFieldEditView",
    "datum/DatumTag",
    "datum/DatumTagEditView",
    "app/UpdatingCollectionView",
    "glosser/Glosser",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    Activity,
    AudioVideoEditView,
    Comment,
    Comments,
    CommentReadView,
    Confidential,
    Datum,
    DatumFieldEditView,
    DatumTag,
    DatumTagEditView,
    UpdatingCollectionView
) {
  var DatumEditView = Backbone.View.extend(
  /** @lends DatumEditView.prototype */
  {
    /**
     * @class The layout of a single editable Datum. It contains a datum
     *        state, datumFields, datumTags and a datum menu. This is where
     *        the user enters theirs data, the main task of our application.
     * 
     * @property {String} format Valid values are "well"
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      // Create a AudioVideoEditView
      this.audioVideoView = new AudioVideoEditView({
        model : this.model.get("audioVideo")
      });
      
      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
      });
      
      // Create a DatumTagView
      this.datumTagsView = new UpdatingCollectionView({
        collection           : this.model.get("datumTags"),
        childViewConstructor : DatumTagEditView,
        childViewTagName     : "li",
      });

      // Create the DatumFieldsValueEditView
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : "li",
        childViewClass   : "datum-field",
        childViewFormat      : "datum"
      });
      
      this.bind("change:audioVideo", this.playAudio, this);
    },

    /**
     * The underlying model of the DatumEditView is a Datum.
     */
    model : Datum,
    
    /**
     * Events that the DatumEditView is listening to and their handlers.
     */
    events : {
      "click .add-comment-datum-edit" : 'insertNewComment',

      "click .icon-unlock" : "encryptDatum",
      "click .icon-lock" : "decryptDatum",
      "click .icon-eye-open" : function(e){
        var confidential = app.get("corpus").get("confidential");
        if(!confidential){
          alert("This is a bug: cannot find decryption module for your corpus.")
        }
        var self = this;
        confidential.turnOnDecryptedMode(function(){
          self.$el.find(".icon-eye-open").toggleClass("icon-eye-close icon-eye-open");
        });

        return false;
      },
      "click .icon-eye-close" : function(e){
        var confidential = app.get("corpus").get("confidential");
        if(!confidential){
          alert("This is a bug: cannot find decryption module for your corpus.")
        }
        confidential.turnOffDecryptedMode();
        this.$el.find(".icon-eye-close").toggleClass("icon-eye-close icon-eye-open");

        return false;
      },

      "change" : "updatePouch",
      "click .add_datum_tag" : "insertNewDatumTag",
      "keyup .add_tag" : function(e) {
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if (code == 13) {
          this.insertNewDatumTag();
        }
      },
      "click #duplicate" : "duplicateDatum",
      "click .icon-plus" : "newDatum",
      "change .datum_state_select" : "updateDatumStates",
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
      "blur .utterance .datum_field_input" : function(e) {
        var utteranceLine = $(e.currentTarget).val();
        if(! window.app.get("corpus").lexicon.get("lexiconNodes") ){
          //This will get the lexicon to load from local storage if the app is offline, only after the user starts typing in datum.
          window.app.get("corpus").lexicon.buildLexiconFromLocalStorage(this.model.get("corpusname"));
        }
        if (utteranceLine) {
          var morphemesLine = Glosser.morphemefinder(utteranceLine);
          if (this.$el.find(".morphemes .datum_field_input").val() == "") {
            // If the morphemes line is empty, make it a copy of the utterance
            this.$el.find(".morphemes .datum_field_input").val(utteranceLine);
            
            this.needsSave = true;
          }
          // If the guessed morphemes is different than the unparsed utterance 
          if (morphemesLine != utteranceLine && morphemesLine != "") {
            //trigger the gloss guessing
            this.guessGlosses(morphemesLine);
            // Ask the user if they want to use the guessed morphemes
            if (confirm("Would you like to use these morphemes:\n" + morphemesLine)) {
              // Replace the morphemes line with the guessed morphemes
              this.$el.find(".morphemes .datum_field_input").val(morphemesLine);
              //redo the gloss guessing
              this.guessGlosses(morphemesLine);
              
              this.needsSave = true;
            }
          }
        }
      },
      "blur .morphemes .datum_field_input" : function(e){
        if(! window.app.get("corpus").lexicon.get("lexiconNodes") ){
          //This will get the lexicon to load from local storage if the app is offline, only after the user starts typing in datum.
          window.app.get("corpus").lexicon.buildLexiconFromLocalStorage(this.model.get("corpusname"));
        }
        this.guessGlosses($(e.currentTarget).val());
      }
    },

    /**
     * The Handlebars template rendered as the DatumEditView.
     */
    template : Handlebars.templates.datum_edit_embedded,

    /**
     * Renders the DatumEditView and all of its partials.
     */
    render : function() {
      Utils.debug("DATUM render: " + this.el);
      
      var jsonToRender = this.model.toJSON();
      jsonToRender.datumStates = this.model.get("datumStates").toJSON();
      jsonToRender.decryptedMode = window.app.get("corpus").get("confidential").decryptedMode;
      
      if (this.format == "well") {
        // Display the DatumEditView
        $(this.el).html(this.template(jsonToRender));
        
        // Display audioVideo View
        this.audioVideoView.el = this.$(".audio_video");
        this.audioVideoView.render();
        
        // Display the DatumTagsView
        this.datumTagsView.el = this.$(".datum_tags_ul");
        this.datumTagsView.render();
        
        // Display the CommentReadView
        this.commentReadView.el = this.$('.comments');
        this.commentReadView.render();
        
        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$(".datum_fields_ul");
        this.datumFieldsView.render();
        var self = this;
        window.setTimeout(function(){
          $('.datum-field').each(function(index, item) {
            item.classList.add( $(item).find("label").html() );
            $(".datum_field_input").each(function(index){
              this.addEventListener('drop', window.appView.dragUnicodeToField, false);
              this.addEventListener('dragover', window.appView.handleDragOver, false);
            });
          });
          self.hideRareFields();
        }, 1000);
       
        
        
      }

      return this;
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
        var self = this;
        this.model.saveAndInterConnectInApp(function(){
          window.appView.toastUser("Automatically saving visible datum entries every 10 seconds. Datum: "+self.model.id,"alert-success","Saved!");
        },function(){
          window.appView.toastUser("Unable to save datum: "+self.model.id,"alert-danger","Not saved!");
        });
      }
    },
    
    insertNewDatumTag : function() {
      // Create the new DatumTag based on what the user entered
      var t = new DatumTag({
        "tag" : this.$el.find(".add_tag").val()
      });
      
      // Add the new DatumTag to the Datum's list for datumTags 
      this.model.get("datumTags").add(t);
      
      // Reset the "add" textbox
      this.$el.find(".add_tag").val("");
      
      return false;
    },
    
    insertNewComment : function() {
      var m = new Comment({
        "text" : this.$el.find(".comment-new-text").val(),
      });
      this.model.get("comments").add(m);
      this.$el.find(".comment-new-text").val("");
    },
    
    updateDatumStates : function() {
      var selectedValue = this.$el.find(".datum_state_select").val();
      this.model.get("datumStates").where({selected : "selected"})[0].set("selected", "");
      this.model.get("datumStates").where({state : selectedValue})[0].set("selected", "selected");
      
      this.needsSave = true;
    },
    
    /**
     * Adds a new Datum to the current Corpus in the current Session. It is
     * placed at the top of the datumsView, pushing off the bottom Datum, if
     * necessary.
     */
    newDatum : function() {
      // Add a new Datum to the top of the Datum stack
      appView.datumsEditView.newDatum();
    },
    
    /** 
     * Adds a new Datum to the current Corpus in the current Session with the same
     * values as the Datum where the Copy button was clicked.
     */
    duplicateDatum : function() {      
      // Add it as a new Datum to the top of the Datum stack
      var d = this.model.clone();
      delete d.attributes.dateEntered;
      delete d.attributes.dateModified;
      d.set("session", app.get("currentSession"));
      appView.datumsEditView.prependDatum(d);
    },
    /*
     * this function can be used to play datum automatically
     */
    playAudio : function(){
      if(this.model.get("audioVideo")){
          this.$el.find(".datum-audio-player")[0].play();
      }
    },
    guessGlosses : function(morphemesLine) {
      if (morphemesLine) {
        var glossLine = Glosser.glossFinder(morphemesLine);
        if (this.$el.find(".gloss .datum_field_input").val() == "") {
          // If the gloss line is empty, make it a copy of the morphemes, i took this off it was annoying
//          this.$el.find(".gloss .datum_field_input").val(morphemesLine);
          
          this.needsSave = true;
        }
        // If the guessed gloss is different than the existing glosses, and the gloss line has something other than question marks
        if (glossLine != morphemesLine && glossLine != "" && glossLine.replace(/[ ?]/g,"") != "") {
          // Ask the user if they want to use the guessed gloss
          if (confirm("Would you like to use this gloss:\n" + glossLine)) {
            // Replace the gloss line with the guessed gloss
            this.$el.find(".gloss .datum_field_input").val(glossLine);
            
            this.needsSave = true;
          }
        }
      }
    }
  });

  return DatumEditView;
});
