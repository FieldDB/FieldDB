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
    "datum/DatumTagReadView",
    "datum/SessionReadView",
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
        childViewTagName     : "li",
        childViewClass   : "datum-field",
        childViewFormat      : "datum"
      });
      
      this.sessionView = new SessionReadView({
        model : this.model.get("session"),
        });
      this.sessionView.format = "link";
      
      this.model.bind("change:audioVideo", this.playAudio, this);
      this.model.bind("change:dateModified", this.updateLastModifiedUI, this);
    },

    /**
     * The underlying model of the DatumEditView is a Datum.
     */
    model : Datum,
    
    /**
     * Events that the DatumEditView is listening to and their handlers.
     */
    events : {
      /* Prevent clicking on the help conventions from reloading the page to # */
      "click .help-conventions" :function(e){
        if(e){
          e.preventDefault();
        }
      },
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
      "click .add-comment-datum" : 'insertNewComment',
      
      "change" : "updatePouch",//TODO this shouldnt be happening?
      
      "blur .utterance .datum_field_input" : "utteranceBlur",
      "blur .morphemes .datum_field_input" : "morphemesBlur",
      "click .save-datum" : "saveButton"
    },

    /**
     * The Handlebars template rendered as the DatumEditView.
     */
    template : Handlebars.templates.datum_edit_embedded,

    /**
     * Renders the DatumEditView and all of its partials.
     */
    render : function() {
      Utils.debug("DATUM render: " );
      
      if(this.collection){
        Utils.debug("This datum has a link to a collection. Removing the link.");
//        delete this.collection;
      }
      var jsonToRender = this.model.toJSON();
      jsonToRender.datumStates = this.model.get("datumStates").toJSON();
      jsonToRender.decryptedMode = window.app.get("corpus").get("confidential").decryptedMode;
      try{
        jsonToRender.statecolor = this.model.get("datumStates").where({selected : "selected"})[0].get("color");
        jsonToRender.datumstate = this.model.get("datumStates").where({selected : "selected"})[0].get("state");
      }catch(e){
        Utils.debug("There was a problem fishing out which datum state was selected.");
      }
      jsonToRender.dateModified = Utils.prettyDate(jsonToRender.dateModified);
      
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
        
        // Display the SessionView
        this.sessionView.el = this.$('.session-link'); 
        this.sessionView.render();
        
        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$(".datum_fields_ul");
        this.datumFieldsView.render();
        var self = this;
        window.setTimeout(function(){
          $('.datum-field').each(function(index, item) {
            item.classList.add( $(item).find("label").html() );
            $(".datum_field_input").each(function(index){
              this.addEventListener('drop', window.appView.dragUnicodeToField);
              this.addEventListener('dragover', window.appView.handleDragOver);
              this.addEventListener('dragleave', function(){
                $(this).removeClass("over");
              } );
            });
          });
          self.hideRareFields();
        }, 500);
            
        //localization for edit well view
        $(this.el).find(".locale_See_Fields").attr("title", Locale["locale_See_Fields"].message);
//      $(this.el).find(".locale_Add_Tags_Tooltip").attr("title", Locale["locale_Add_Tags_Tooltip"].message);
        $(this.el).find(".locale_Add").html(Locale["locale_Add"].message);
        $(this.el).find(".locale_Save").html(Locale["locale_Save"].message);
        $(this.el).find(".locale_Insert_New_Datum").attr("title", Locale["locale_Insert_New_Datum"].message);
        $(this.el).find(".locale_Plain_Text_Export_Tooltip").attr("title", Locale["locale_Plain_Text_Export_Tooltip"].message);
        $(this.el).find(".locale_Duplicate").attr("title", Locale["locale_Duplicate"].message);
        if(jsonToRender.confidential){
          $(this.el).find(".locale_Encrypt").attr("title", Locale["locale_Decrypt"].message);
        }else{
          $(this.el).find(".locale_Encrypt").attr("title", Locale["locale_Encrypt"].message);
        }
        if(jsonToRender.decryptedMode){
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Hide_confidential_items_Tooltip"].message);
        }else{
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Show_confidential_items_Tooltip"].message);
        } 
        $(this.el).find(".locale_LaTeX").attr("title", Locale["locale_LaTeX"].message);
        $(this.el).find(".locale_CSV_Tooltip").attr("title", Locale["locale_CSV_Tooltip"].message);
        
        $(this.el).find(".locale_Drag_and_Drop_Audio_Tooltip").attr("title", Locale["locale_Drag_and_Drop_Audio_Tooltip"].message);
      }

      return this;
    },
    
    rareFields : [],
    frequentFields: ["judgement","utterance","morphemes","gloss","translation"],
    hideRareFields : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
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
    
    updatePouch : function() {
      this.needsSave = true;
    },

    
    saveButton : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      if (this.needsSave) {
          this.saveScreen();
      }else {
        window.appView.toastUser("This datum "+this.model.id+"has no unsaved changes","alert-success","Saved!");

      };
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
    
    insertNewComment : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      var commentstring = this.$el.find(".comment-new-text").val();
      var m = new Comment({
        "text" : commentstring,
      });
      this.model.get("comments").add(m);
      this.$el.find(".comment-new-text").val("");
      
      var utterance = this.model.get("datumFields").where({label: "utterance"})[0].get("mask");

      window.app.get("currentCorpusTeamActivityFeed").addActivity(
          new Activity({
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <i class='icon-list'></i><a href='#corpus/"+this.model.get("pouchname")+"/datum/"+this.model.id+"'>"+utterance+"</a> ",
            teamOrPersonal : "team",
            context : " via Offline App."
          }));
      
      window.app.get("currentUserActivityFeed").addActivity(
          new Activity({
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <i class='icon-list'></i><a href='#corpus/"+this.model.get("pouchname")+"/datum/"+this.model.id+"'>"+utterance+"</a> ",
            teamOrPersonal : "personal",
            context : " via Offline App."
          }));
      
    },
    
    updateDatumStates : function() {
      var selectedValue = this.$el.find(".datum_state_select").val();
      try{
        this.model.get("datumStates").where({selected : "selected"})[0].set("selected", "");
        this.model.get("datumStates").where({state : selectedValue})[0].set("selected", "selected");
      }catch(e){
        Utils.debug("problem getting color of datum state, probaly none are selected.",e);
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
          this.needsSave = true;
      }
    },
    /*
     * This function helps the user know that the app is saving his/her data often,
     * it updates the time, without re-rendering the datum
     */
    updateLastModifiedUI : function(){
      $(this.el).find(".last-modified").html(Utils.prettyDate(this.model.get("dateModified")));//("0 seconds ago");
      $(this.el).find(".date-created").html(this.model.get("dateEntered"));
    },
    utteranceBlur : function(e){
      var utteranceLine = $(e.currentTarget).val();
      if(! window.app.get("corpus").lexicon.get("lexiconNodes") ){
        //This will get the lexicon to load from local storage if the app is offline, only after the user starts typing in datum.
        window.app.get("corpus").lexicon.buildLexiconFromLocalStorage(this.model.get("pouchname"));
      }
      if (utteranceLine) {
        var morphemesLine = Glosser.morphemefinder(utteranceLine);
        if (this.$el.find(".morphemes .datum_field_input").val() == "") {
          // If the morphemes line is empty, make it a copy of the utterance
          this.$el.find(".morphemes .datum_field_input").val(utteranceLine);
          this.needsSave = true;
          
//          //autosize the morphemes field
//          var datumself = this;
//          window.setTimeout(function(){
//            $(datumself.el).find(".morphemes .datum_field_input").autosize();//This comes from the jquery autosize library which makes the datum text areas fit their size. https://github.com/jackmoore/autosize/blob/master/demo.html
//          },500);
        }
        // If the guessed morphemes is different than the unparsed utterance 
        if (morphemesLine != utteranceLine && morphemesLine != "") {
          //trigger the gloss guessing
          this.guessGlosses(morphemesLine);
          // Ask the user if they want to use the guessed morphemes
          if (confirm("Would you like to use these morphemes:\n" + morphemesLine)) {
            // Replace the morphemes line with the guessed morphemes
            this.$el.find(".morphemes .datum_field_input").val(morphemesLine);
            this.needsSave = true;
            //redo the gloss guessing
            this.guessGlosses(morphemesLine);
            
//            //autosize the morphemes field
//            var datumself = this;
//            window.setTimeout(function(){
//              $(datumself.el).find(".morphemes .datum_field_input").autosize();//This comes from the jquery autosize library which makes the datum text areas fit their size. https://github.com/jackmoore/autosize/blob/master/demo.html
//            },500);

          }
        }
      }
    },
    morphemesBlur : function(e){
      if(! window.app.get("corpus").lexicon.get("lexiconNodes") ){
        //This will get the lexicon to load from local storage if the app is offline, only after the user starts typing in datum.
        window.app.get("corpus").lexicon.buildLexiconFromLocalStorage(this.model.get("pouchname"));
      }
      this.guessGlosses($(e.currentTarget).val());
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
        if (glossLine != morphemesLine && glossLine != "" && glossLine.replace(/[ ?-]/g,"") != "") {
          // Ask the user if they want to use the guessed gloss
          if (confirm("Would you like to use this gloss:\n" + glossLine)) {
            // Replace the gloss line with the guessed gloss
            this.$el.find(".gloss .datum_field_input").val(glossLine);
            this.needsSave = true;
            //autosize the gloss field
//            var datumself = this;
//            window.setTimeout(function(){
//              $(datumself.el).find(".gloss .datum_field_input").autosize();//This comes from the jquery autosize library which makes the datum text areas fit their size. https://github.com/jackmoore/autosize/blob/master/demo.html
//            },500);
          }
        }
      }
    }
  });

  return DatumEditView;
});
