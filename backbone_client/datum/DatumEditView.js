define([
    "backbone", 
    "handlebars", 
    "audio_video/AudioVideoEditView",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "comment/CommentEditView",
    "confidentiality_encryption/Confidential",
    "datum/Datum",
    "datum/DatumFieldEditView",
    "datum/DatumTag",
    "datum/DatumTagEditView",
    "datum/DatumTagReadView",
    "datum/SessionReadView",
    "app/UpdatingCollectionView",
    "glosser/Glosser",
    "glosser/Tree",
    "OPrime"
], function(
    Backbone, 
    Handlebars, 
    AudioVideoEditView,
    Comment,
    Comments,
    CommentReadView,
    CommentEditView,
    Confidential,
    Datum,
    DatumFieldEditView,
    DatumTag,
    DatumTagEditView,
    DatumTagReadView,
    SessionReadView,
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
      
      this.commentEditView = new CommentEditView({
        model : new Comment(),
      });
      
      // Create a DatumTagView
      this.datumTagsView = new UpdatingCollectionView({
        collection           : this.model.get("datumTags"),
        childViewConstructor : DatumTagReadView,
        childViewTagName     : "li",
      });

      // Create the DatumFieldsValueEditView
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : "tr",
        childViewClass   : "datum-field",
        childViewFormat      : "datum"
      });

      this.model.fillWithCorpusFieldsIfMissing();
      
      this.sessionView = new SessionReadView({
        model : this.model.get("session"),
        });
      this.sessionView.format = "link";
      
      this.model.bind("change:audioVideo", this.playAudio, this);
      this.model.bind("change:dateModified", this.updateLastModifiedUI, this);
      this.prepareDatumFieldAlternatesTypeAhead();
    },

    /**
     * The underlying model of the DatumEditView is a Datum.
     */
    model : Datum,
    
    /**
     * Events that the DatumEditView is listening to and their handlers.
     */
    events : {
      /* Menu */
      "click .LaTeX" : function(){
        this.model.latexitDatum(true);
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
      
      /* Edit Only Menu */
      "click .icon-unlock" : "encryptDatum",
      "click .icon-lock" : "decryptDatum",
      "click .icon-eye-open" : function(e){
        var confidential = app.get("corpus").get("confidential");
        if(!confidential){
          alert("This is a bug: cannot find decryption module for your corpus.");
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
          alert("This is a bug: cannot find decryption module for your corpus.");
        }
        confidential.turnOffDecryptedMode();
        this.$el.find(".icon-eye-close").toggleClass("icon-eye-close icon-eye-open");

        return false;
      },
      "click .icon-copy" : "duplicateDatum",
      "click .icon-plus" : "newDatum",
      "click .add_datum_tag" : "insertNewDatumTag",
      "keyup .add_tag" : function(e) {
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if (code == 13) {
          this.insertNewDatumTag();
        }
      },
      "change .datum_state_select" : "updateDatumStates",
      
      "blur .utterance .datum_field_input" : "utteranceBlur",
      "blur .morphemes .datum_field_input" : "morphemesBlur",
      "focus .morphemes .datum_field_input" : function(e){
        if( this.lastMorphemsFocus && Date.now() - this.lastMorphemsFocus < 1000 ){
          return;
        }
        this.lastMorphemsFocus = Date.now();
        this.guessMorphemes(this.$el.find(".utterance .datum_field_input").val());
        this.guessUtterance($(e.target).val());
      },
      "focus .gloss .datum_field_input" : function(){
        if( this.lastGlossFocus && Date.now() - this.lastGlossFocus < 1000 ){
          return;
        }
        this.lastGlossFocus = Date.now();
        this.guessGlosses(this.$el.find(".morphemes .datum_field_input").val());
        this.guessUtterance(this.$el.find(".morphemes .datum_field_input").val());

      },
      "click .save-datum" : "saveButton",

      // Issue #797
       "click .trash-button" : "putInTrash",

      //Add button inserts new Comment
      "click .add-comment-button" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        /* Ask the comment edit view to get it's current text */
        this.commentEditView.updateComment();
        /* Ask the collection to put a copy of the comment into the collection */
        this.model.get("comments").insertNewCommentFromObject(this.commentEditView.model.toJSON());
        /* empty the comment edit view. */
        this.commentEditView.clearCommentForReuse();
        /* save the state of the datum when the comment is added, and render it*/
        this.saveButton();
        this.commentReadView.render();
      }, 
      //Delete button remove a comment
      "click .remove-comment-button" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.model.get("comments").remove(this.commentEditView.model);
      },     
    
    },

    /**
     * The Handlebars template rendered as the DatumEditView.
     */
    template : Handlebars.templates.datum_edit_embedded,

    /**
     * Renders the DatumEditView and all of its partials.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("DATUM render: " );
      
     
      
      if(this.collection){
        if (OPrime.debugMode) OPrime.debug("This datum has a link to a collection. Removing the link.");
//        delete this.collection;
      }
      var validationStatus = this.model.getValidationStatus();
      var jsonToRender = this.model.toJSON();
      jsonToRender.datumStates = this.model.get("datumStates").toJSON();
      jsonToRender.decryptedMode = window.app.get("corpus").get("confidential").decryptedMode;
      try{
        jsonToRender.statecolor = this.model.get("datumStates").where({selected : "selected"})[0].get("color");
        jsonToRender.datumstate = this.model.get("datumStates").where({selected : "selected"})[0].get("state");
      }catch(e){
        if (OPrime.debugMode) OPrime.debug("There was a problem fishing out which datum state was selected.");
      }
      jsonToRender.dateModified = OPrime.prettyDate(jsonToRender.dateModified);
      
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
        this.commentReadView.el = $(this.el).find('.comments');
        this.commentReadView.render();
        
        // Display the CommentEditView
        this.commentEditView.el = $(this.el).find('.new-comment-area'); 
        this.commentEditView.render();
        
        // Display the SessionView
        this.sessionView.el = this.$('.session-link'); 
        this.sessionView.render();
        
        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$(".datum_fields_ul");
        this.datumFieldsView.render();
        
        
        var self = this;
        this.getFrequentFields(function(){
          self.hideRareFields();
        });
            
        //localization for edit well view
        $(this.el).find(".locale_See_Fields").attr("title", Locale.get("locale_See_Fields"));
//      $(this.el).find(".locale_Add_Tags_Tooltip").attr("title", Locale.get("locale_Add_Tags_Tooltip"));
        $(this.el).find(".locale_Save").html(Locale.get("locale_Save"));
        $(this.el).find(".locale_Insert_New_Datum").attr("title", Locale.get("locale_Insert_New_Datum"));
        $(this.el).find(".locale_Plain_Text_Export_Tooltip").attr("title", Locale.get("locale_Plain_Text_Export_Tooltip"));
        $(this.el).find(".locale_Duplicate").attr("title", Locale.get("locale_Duplicate"));
        if(jsonToRender.confidential){
          $(this.el).find(".locale_Encrypt").attr("title", Locale.get("locale_Decrypt"));
        }else{
          $(this.el).find(".locale_Encrypt").attr("title", Locale.get("locale_Encrypt"));
        }
        if(jsonToRender.decryptedMode){
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale.get("locale_Hide_confidential_items_Tooltip"));
        }else{
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale.get("locale_Show_confidential_items_Tooltip"));
        } 
        $(this.el).find(".locale_LaTeX").attr("title", Locale.get("locale_LaTeX"));
        $(this.el).find(".locale_CSV_Tooltip").attr("title", Locale.get("locale_CSV_Tooltip"));
        
        $(this.el).find(".locale_Drag_and_Drop_Audio_Tooltip").attr("title", Locale.get("locale_Drag_and_Drop_Audio_Tooltip"));
      }

      return this;
    },
    
    rareFields : [],
    frequentFields: null,
    getFrequentFields : function(whenfieldsareknown){
      var self = this;
      window.app.get("corpus").getFrequentDatumFields(null, null, function(fieldLabels){
        self.frequentFields = fieldLabels;
        window.app.get("corpus").frequentFields = fieldLabels;
        if(typeof whenfieldsareknown == "function"){
          whenfieldsareknown();
        }
      });
    },
    hideRareFields : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.rareFields = [];
      if(!this.frequentFields){
        return;
      }
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
    
    showRareFields : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
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
    encryptDatum : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.model.encrypt();
      this.render();
      $(".icon-unlock").toggleClass("icon-unlock icon-lock");
    },

    /**
     * Decrypts the datum if it was encrypted
     */
    decryptDatum : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.model.decrypt();
      this.render();
      $(".icon-lock").toggleClass("icon-unlock icon-lock");
    },

    needsSave : false,
    
    saveButton : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.model.saveAndInterConnectInApp();
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
    
    insertNewDatumTag : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
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
    
    updateDatumStates : function() {
      var selectedValue = this.$el.find(".datum_state_select").val();
      try{
        this.model.get("datumStates").where({selected : "selected"})[0].set("selected", "");
        this.model.get("datumStates").where({state : selectedValue})[0].set("selected", "selected");
      }catch(e){
        if (OPrime.debugMode) OPrime.debug("problem getting color of datum state, probaly none are selected.",e);
      }
      
      //update the view of the datum state to the new color and text without rendering the entire datum
      var statecolor = this.model.get("datumStates").where({state : selectedValue})[0].get("color");
      $(this.el).find(".datum-state-color").removeClass("label-important label-success label-info label-warning label-inverse");
      $(this.el).find(".datum-state-color").addClass("label-"+statecolor);
      $(this.el).find(".datum-state-value").html(selectedValue);

      this.needsSave = true;
    },
    
    /**
     * Adds a new Datum to the current Corpus in the current Session. It is
     * placed at the top of the datumsView, pushing off the bottom Datum, if
     * necessary.
     */
    newDatum : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      // Add a new Datum to the top of the Datum stack
      appView.datumsEditView.newDatum();
    },
    
    /** 
     * Adds a new Datum to the current Corpus in the current Session with the same
     * values as the Datum where the Copy button was clicked.
     */
    duplicateDatum : function(e) { 
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      // Add it as a new Datum to the top of the Datum stack
      var d = this.model.clone();
      delete d.attributes.dateEntered;
      delete d.attributes.dateModified;
      d.set("session", app.get("currentSession"));
      window.appView.datumsEditView.prependDatum(d);
    },
    
    /**
     * See definition in the model
     * 
     */
    putInTrash : function(e){
      if(e){
        e.preventDefault();
      }
      var r = confirm("Are you sure you want to put this datum in the trash?");
      if (r == true) {
        this.model.putInTrash();
      }
    },
    
    
    /*
     * this function can be used to play datum automatically
     */
    playAudio : function(){
      if(this.model.get("audioVideo")){
          this.$el.find(".datum-audio-player")[0].play();
          this.needsSave = true;
      }
    },
    /*
     * This function helps the user know that the app is saving his/her data often,
     * it updates the time, without re-rendering the datum
     */
    updateLastModifiedUI : function(){
      $(this.el).find(".last-modified").html(OPrime.prettyDate(this.model.get("dateModified")));//("0 seconds ago");
      $(this.el).find(".date-created").html(this.model.get("dateEntered"));
    },
    utteranceBlur : function(e){
      var utteranceLine = $(e.currentTarget).val();
      this.guessMorphemes(utteranceLine);
    },
    morphemesBlur : function(e){
      if(! window.app.get("corpus").lexicon.get("lexiconNodes") ){
        //This will get the lexicon to load from local storage if the app is offline, only after the user starts typing in datum.
        window.app.get("corpus").lexicon.buildLexiconFromLocalStorage(this.model.get("pouchname"));
      }
      this.guessUtterance($(e.currentTarget).val());
      this.guessGlosses($(e.currentTarget).val());
      this.guessTree($(e.currentTarget).val());
      this.needsSave = true;

    },
    guessMorphemes : function(utteranceLine){
      if(! window.app.get("corpus").lexicon.get("lexiconNodes") ){
        //This will get the lexicon to load from local storage if the app is offline, only after the user starts typing in datum.
        window.app.get("corpus").lexicon.buildLexiconFromLocalStorage(this.model.get("pouchname"));
      }
      if (utteranceLine) {
        var morphemesLine = Glosser.morphemefinder(utteranceLine);
        
        this.previousMorphemesGuess = this.previousMorphemesGuess || [];
        this.previousMorphemesGuess.push(morphemesLine);
        
        var morphemesField =  this.model.get("datumFields").where({label: "morphemes"})[0];
        var alternates = morphemesField.get("alternates") || [];
        alternates.push(utteranceLine);
        
        // If the guessed morphemes is different than the unparsed utterance 
        if (morphemesLine != utteranceLine && morphemesLine != "") {
          //hey we have a new idea, so trigger the gloss guessing too
          this.guessGlosses(morphemesLine);
          alternates.unshift(morphemesLine);
        }
        morphemesField.set("alternates", _.unique(alternates));
        this.needsSave = true;
        if (this.$el.find(".morphemes .datum_field_input").val() == "" || this.previousMorphemesGuess.indexOf(this.$el.find(".morphemes .datum_field_input").val()) > -1 ) {
          // If the morphemes line is empty, or its from a previous guess, put this guess in.
          morphemesField.set("mask", morphemesLine);
//          this.$el.find(".morphemes .datum_field_input").val(morphemesLine);
          this.needsSave = true;
        }
      }
    },
    guessGlosses : function(morphemesLine) {
      if (morphemesLine) {
        var glossLine = Glosser.glossFinder(morphemesLine);
        
        var glossField =  this.model.get("datumFields").where({label: "gloss"})[0];
        var alternates = glossField.get("alternates") || [];
        alternates.push(morphemesLine);
        
        this.previousGlossGuess = this.previousGlossGuess || [];
        // If the guessed gloss is different than the existing glosses, and the gloss line has something other than question marks
        if (glossLine != morphemesLine && glossLine != "" && glossLine.replace(/[ ?-]/g,"") != "") {
          this.previousGlossGuess.push(glossLine);
          alternates.unshift(glossLine);
        }
        glossField.set("alternates", _.unique(alternates));
        this.needsSave = true;
        if (this.$el.find(".gloss .datum_field_input").val() == "" || this.previousGlossGuess.indexOf(this.$el.find(".gloss .datum_field_input").val()) > -1 ) {
          // If the gloss line is empty, or its from a previous guess, put our new guess there
//          this.$el.find(".gloss .datum_field_input").val(glossLine);
          glossField.set("mask", glossLine);
          this.needsSave = true;
        }
      }
    },
    /**
    when pressing tab after filling morpheme line, guess different trees
    and display them in Latex formatting

    */
    guessTree: function(morphemesLine) {
      if (morphemesLine) {
        var trees = Tree.generate(morphemesLine);
        OPrime.debug(trees);
        var syntacticTreeLatex  = "";
        syntacticTreeLatex +=  "\\item[\\sc{Left}] \\Tree " + trees.left;
        syntacticTreeLatex +=  " \\\\ \n \\item[\\sc{Right}] \\Tree " + trees.right;
        syntacticTreeLatex +=  " \\\\ \n  \\item[\\sc{Mixed}] \\Tree " + trees.mixed;
        // syntacticTreeLatex +=  "Left: "+ trees.left;
        // syntacticTreeLatex +=  "\nRight:" + trees.right;
        // syntacticTreeLatex +=  "\nMixed: " + trees.mixed;
        OPrime.debug(syntacticTreeLatex);
        /* These put the syntacticTree into the actual datum fields on the screen so the user can see them */
        if (this.$el.find(".syntacticTreeLatex .datum_field_input").val() == "" ) {
          this.$el.find(".syntacticTreeLatex .datum_field_input").val(syntacticTreeLatex);
        }        
        var treeField = this.model.get("datumFields").where({label: "syntacticTreeLatex"})[0];
        if (treeField) {
          treeField.set("mask", syntacticTreeLatex);
          this.needsSave = true;
        }
      }
    },
    guessUtterance : function(morphemesLine) {
      if (morphemesLine) {
        // If the utterance line is empty, make it a copy of the morphemes, with out the -
        if (this.$el.find(".utterance").find(".datum_field_input").val() == "") {
          var utteranceLine = morphemesLine.replace(/-/g,"");
          /* uppercase the first letter of the line */
          utteranceLine =  utteranceLine.charAt(0).toUpperCase() + utteranceLine.slice(1);

          this.$el.find(".utterance").find(".datum_field_input").val(utteranceLine);
          this.needsSave = true;
        }
      }
    },
    prepareDatumFieldAlternatesTypeAhead : function(){
      var validationStatusField =  this.model.get("datumFields").where({label: "validationStatus"})[0];
      window.app.get("corpus").getFrequentDatumValidationStates(null, null, function(results){
        validationStatusField.set("alternates", results);
      });
      
      var tagField =  this.model.get("datumFields").where({label: "tags"})[0];
      window.app.get("corpus").getFrequentDatumTags(null, null, function(results){
        tagField.set("alternates", results);
      });
      
    }
  });

  return DatumEditView;
});
