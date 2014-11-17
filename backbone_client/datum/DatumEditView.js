define([
    "backbone",
    "handlebars",
    "audio_video/AudioVideoReadView",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "comment/CommentEditView",
    "confidentiality_encryption/Confidential",
    "datum/Datum",
    "datum/DatumFieldEditView",
    "datum/DatumReadView",
    "datum/DatumTag",
    "datum/DatumTagEditView",
    "datum/DatumTagReadView",
    "image/ImagesView",
    "datum/SessionReadView",
    "app/UpdatingCollectionView",
    "bower_components/fielddb-glosser/fielddb-glosser",
    "OPrime"
], function(
    Backbone,
    Handlebars,
    AudioVideoReadView,
    Comment,
    Comments,
    CommentReadView,
    CommentEditView,
    Confidential,
    Datum,
    DatumFieldEditView,
    DatumReadView,
    DatumTag,
    DatumTagEditView,
    DatumTagReadView,
    ImagesView,
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
      // Create a AudioVideoReadView
      this.audioVideoView = new UpdatingCollectionView({
        collection           : this.model.get("audioVideo"),
        childViewConstructor : AudioVideoReadView,
        childViewTagName     : 'li'
      });

      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
      });

      this.imagesEditView = new ImagesView({
        model : this.model.get("images"),
      });

      this.commentEditView = new CommentEditView({
        model : new Comment(),
      });

      this.datumEasierToReadIGTAlignedView = new DatumReadView({
        model : this.model
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

      this.sessionView = new SessionReadView({
        model : this.model.get("session"),
        });
      this.sessionView.format = "link";

      this.model.bind("change:audioVideo", this.playAudio, this);
      this.model.bind("change:dateModified", this.updateLastModifiedUI, this);
      this.bind("change:datumFields", this.reloadIGTPreview, this);

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
        this.model.exportAsCSV(true, null);
        $("#export-modal").modal("show");
      },
      "click .XML" : function(){
        this.model.exportAsIGTXML(true, null);
        $("#export-modal").modal("show");
      },
      "click .JSON" : function(){
        this.model.exportAsIGTJSON(true, null);
        $("#export-modal").modal("show");
      },
      "click .icon-th-list" : "hideRareFields",
      "click .icon-list-alt" : "showRareFields",
      "click .play-audio": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.playAudio(e);
      },
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
      "blur .validationStatus" : "updateDatumStateColor",

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
      this.model.startReadTimeIfNotAlreadyStarted();
      if (OPrime.debugMode) OPrime.debug("DATUM render: " );

      if(this.collection){
        if (OPrime.debugMode) OPrime.debug("This datum has a link to a collection. Removing the link.");
//        delete this.collection;
      }
      var jsonToRender = this.model.toJSON();
      jsonToRender.utterance = jsonToRender.datumFields.toJSON()[1].mask;
      jsonToRender.translation = jsonToRender.datumFields.toJSON()[6].mask;
      jsonToRender.decryptedMode = window.app.get("corpus").get("confidential").decryptedMode;
      jsonToRender.datumstate = this.model.getValidationStatus();
      if(jsonToRender.datumstate.length > 30){
         jsonToRender.datumstate =  jsonToRender.datumstate.substring(0,12) + "..." + jsonToRender.datumstate.substring(jsonToRender.datumstate.length-12, jsonToRender.datumstate.length);
      }
      jsonToRender.datumstatecolor = this.model.getValidationStatusColor(jsonToRender.datumstate);
      jsonToRender.dateModified = OPrime.prettyDate(jsonToRender.dateModified);

//    jsonToRender.locale_Add_Tags_Tooltip = Locale.get(locale_Add_Tags_Tooltip);
      jsonToRender.locale_CSV_Tooltip = Locale.get("locale_CSV_Tooltip");
      jsonToRender.locale_XML_Tooltip = Locale.get("locale_XML_Tooltip");
      jsonToRender.locale_JSON_Tooltip = Locale.get("locale_JSON_Tooltip");
      jsonToRender.locale_Drag_and_Drop_Audio_Tooltip = Locale.get("locale_Drag_and_Drop_Audio_Tooltip");
      jsonToRender.locale_Duplicate = Locale.get("locale_Duplicate");
      jsonToRender.locale_Insert_New_Datum = Locale.get("locale_Insert_New_Datum");
      jsonToRender.locale_LaTeX = Locale.get("locale_LaTeX");
      jsonToRender.locale_Play_Audio = Locale.get("locale_Play_Audio");
      jsonToRender.locale_Plain_Text_Export_Tooltip = Locale.get("locale_Plain_Text_Export_Tooltip");
      jsonToRender.locale_Save = Locale.get("locale_Save");
      jsonToRender.locale_See_Fields = Locale.get("locale_See_Fields");
      if(jsonToRender.confidential){
        jsonToRender.locale_Encrypt = Locale.get("locale_Decrypt");
      }else{
        jsonToRender.locale_Encrypt = Locale.get("locale_Encrypt");
      }
      if(jsonToRender.decryptedMode){
        jsonToRender.locale_Show_confidential_items_Tooltip = Locale.get("locale_Hide_confidential_items_Tooltip");
      }else{
        jsonToRender.locale_Show_confidential_items_Tooltip = Locale.get("locale_Show_confidential_items_Tooltip");
      }
      if (!this.model.id) {
        jsonToRender.buttonColor = "primary";
      }



      if (this.format == "well") {
        // Display the DatumEditView
        $(this.el).html(this.template(jsonToRender));

        // Display audioVideo View
        this.audioVideoView.el = this.$(".audio_video_ul");
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

        // Display the imagesEditView
        this.imagesEditView.el = $(this.el).find('.images-area');
        this.imagesEditView.render();

        // Display the DatumReadView
        this.datumEasierToReadIGTAlignedView.el = $(this.el).find('.preview_IGT_area');
        this.datumEasierToReadIGTAlignedView.format = "latexPreviewIGTonly";
        this.datumEasierToReadIGTAlignedView.render();

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

      }

      return this;
    },

    rareFields : [],
    frequentFields: null,
    getFrequentFields : function(whenfieldsareknown){
      var self = this;
      window.app.get("corpus").getFrequentDatumFields(null, null, function(fieldLabels){
        // this is one way of hiding the usernames regardles of if they are informative
        // fieldLabels.push("enteredByUser");
        // fieldLabels.push("modifiedByUser");
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
      $(this.el).find(".extra-datum-info-which-can-be-hidden").hide();
      this.rareFields = [];
      if(!this.frequentFields){
        return;
      }
      for(var f = 0; f < this.model.get("datumFields").length; f++ ){
        //hide entered by user or modified by user if they match the person logged in (ie are not informative because only one person is working on this corpus.)
        var fieldValue  = this.model.get("datumFields").models[f].get("mask");
        var currentUsername = window.app.get("authentication").get("userPrivate").get("username");
        var fieldsLabel = this.model.get("datumFields").models[f].get("label") ;
        if( (fieldsLabel.indexOf("ByUser") > -1 && !fieldValue ) || fieldValue == currentUsername || this.frequentFields.indexOf( fieldsLabel ) == -1 ){
          $(this.el).find("."+this.model.get("datumFields").models[f].get("label")).hide();
          this.rareFields.push(this.model.get("datumFields").models[f].get("label"));
        }
      }
      /* make ungrammatical sentences have a strike through them */
      var grammaticality = this.$el.find(".judgement .datum_field_input").val();
      if (grammaticality.indexOf("*") !== -1) {
        this.$el.find(".utterance .datum_field_input").addClass("ungrammatical");
      }

      $(this.el).find(".icon-th-list").addClass("icon-list-alt");
      $(this.el).find(".icon-th-list").removeClass("icon-th-list");
      this.updateDatumStateColor();

    },

    showRareFields : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      $(this.el).find(".extra-datum-info-which-can-be-hidden").show();

      for(var f = 0; f < this.model.get("datumFields").length; f++ ){
        $(this.el).find("."+this.model.get("datumFields").models[f].get("label")).show();
      }
      rareFields = [];
      $(this.el).find(".icon-list-alt").addClass("icon-th-list");
      $(this.el).find(".icon-list-alt").removeClass("icon-list-alt");

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

    updateDatumStateColor : function() {
      var jsonToRender = {};
      jsonToRender.datumstate = this.model.getValidationStatus();
      jsonToRender.datumstatecolor = this.model.getValidationStatusColor(jsonToRender.datumstate);

      if(!jsonToRender.datumstatecolor){
        jsonToRender.datumstatecolor= "";
      }
      $(this.el).find(".datum_fields_ul textarea ").removeClass("datum-primary-validation-status-outline-color-warning");
      $(this.el).find(".datum_fields_ul textarea").removeClass("datum-primary-validation-status-outline-color-important");
      $(this.el).find(".datum_fields_ul textarea").removeClass("datum-primary-validation-status-outline-color-info");
      $(this.el).find(".datum_fields_ul textarea").removeClass("datum-primary-validation-status-outline-color-success");
      $(this.el).find(".datum_fields_ul textarea").removeClass("datum-primary-validation-status-outline-color-inverse");

      $(this.el).find(".datum_fields_ul textarea").addClass("datum-primary-validation-status-outline-color-"+jsonToRender.datumstatecolor);

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
    playAudio : function(e){
      var audioFileName = this.model.getAudioFileName();
      if (audioFileName) {
        this.model.playAudio("audiovideo_" + audioFileName, e.target);
      }else{
        e.target.disabled = true;
        $(e.target).addClass("disabled");
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
      // var utteranceField =  this.model.get("datumFields").where({label: "utterance"})[0];
      // if (utteranceField.get("mask").trim() == utteranceLine.trim()) {
      //   return;
      // }
      this.updateDatumStateColor();
      this.guessMorphemes(utteranceLine);
      this.reloadIGTPreview();
    },
    morphemesBlur : function(e){
      var morphemesLine = $(e.currentTarget).val();
      // var morphemesField =  this.model.get("datumFields").where({label: "morphemes"})[0];
      // if (morphemesField.get("mask").trim() == morphemesLine.trim()) {
      //   return;
      // }
      this.guessUtterance(morphemesLine);
      this.guessGlosses(morphemesLine);
      this.guessTree(morphemesLine);
      this.needsSave = true;
      this.reloadIGTPreview();

    },
    previousUtterance : null,
    previousMorphemes : null,
    previousGloss : null,
    guessMorphemes: function(utteranceLine) {
      if (utteranceLine && (!this.previousUtterance || (this.previousUtterance != utteranceLine))) {
        this.previousUtterance = utteranceLine;
        var asIGT = this.model.exportAsIGTJSON();
        asIGT.utterance = utteranceLine;
        asIGT.morphemes = ""; // force glosser to guess becaus the app handles if it matches previous guesses
        var morphemesLine = Glosser.guessMorphemesFromUtterance(asIGT).morphemes;

        this.previousMorphemesGuess = this.previousMorphemesGuess || [];
        this.previousMorphemesGuess.push(morphemesLine);

        var morphemesField = this.model.get("datumFields").where({
          label: "morphemes"
        })[0];
        var alternates = morphemesField.get("alternates") || [];
        alternates.push(utteranceLine);

        // If the guessed morphemes is different than the unparsed utterance, and different than the previous morphemes line we guessed on
        if (morphemesLine != utteranceLine && morphemesLine != "" && (!this.previousMorphemes || (this.previousMorphemes != morphemesLine))) {
          this.previousMorphemes = morphemesLine;
          //hey we have a new idea, so trigger the gloss guessing too
          this.guessGlosses(morphemesLine, asIGT);
          alternates.unshift(morphemesLine);
        }
        morphemesField.set("alternates", _.unique(alternates));
        this.needsSave = true;
        if (this.$el.find(".morphemes .datum_field_input").val() == "" || this.previousMorphemesGuess.indexOf(this.$el.find(".morphemes .datum_field_input").val()) > -1) {
          // If the morphemes line is empty, or its from a previous guess, put this guess in.
          morphemesField.set("mask", morphemesLine);
          //          this.$el.find(".morphemes .datum_field_input").val(morphemesLine);
          this.needsSave = true;
        }
      }
    },

    guessGlosses: function(morphemesLine, asIGT) {
      var glossField = this.model.get("datumFields").where({
        label: "gloss"
      })[0];
      var currentGloss = glossField.get("mask") || "";
      if (morphemesLine && (!currentGloss || !this.previousMorphemes || (this.previousMorphemes != morphemesLine))) {
        this.previousMorphemes = morphemesLine;
        var forceGuess = !!asIGT;
        var asIGT = asIGT || this.model.exportAsIGTJSON();
        if (forceGuess) {
          asIGT.gloss = "";
        }
        asIGT.morphemes = morphemesLine;
        var glossLine = Glosser.guessGlossFromMorphemes(asIGT).gloss;

        var alternates = glossField.get("alternates") || [];
        alternates.push(morphemesLine);

        this.previousGlossGuess = this.previousGlossGuess || [];
        // If the guessed gloss is different than the existing glosses, and the gloss line has something other than question marks
        if (glossLine != morphemesLine && glossLine != "" && glossLine.replace(/[ ?-]/g, "") != "") {
          this.previousGlossGuess.push(glossLine);
          alternates.unshift(glossLine);
        }
        glossField.set("alternates", _.unique(alternates));
        this.needsSave = true;
        if (this.$el.find(".gloss .datum_field_input").val() == "" || this.previousGlossGuess.indexOf(this.$el.find(".gloss .datum_field_input").val()) > -1) {
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
        var syntacticTreeLatex  = this.model.guessTree(morphemesLine);
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
          var asIGT = this.model.exportAsIGTJSON();
          var utteranceLine = Glosser.guessUtteranceFromMorphemes(asIGT).utterance;
          /* uppercase the first letter of the line */
          // utteranceLine =  utteranceLine.charAt(0).toUpperCase() + utteranceLine.slice(1);

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

    },
    reloadIGTPreview: function(){
      // Display the DatumReadView
      this.datumEasierToReadIGTAlignedView.model = this.model;
      this.datumEasierToReadIGTAlignedView.render();
    }
  });

  return DatumEditView;
});
