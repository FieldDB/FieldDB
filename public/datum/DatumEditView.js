define([
    "backbone", 
    "handlebars", 
    "audio_video/AudioVideoEditView",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentEditView",
    "confidentiality_encryption/Confidential",
    "datum/Datum",
    "datum/DatumFieldEditView",
    "datum/DatumTag",
    "datum/DatumTagEditView",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    AudioVideoEditView,
    Comment,
    Comments,
    CommentEditView,
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
        model : this.model.get("audioVideo"),
        
        
      });
      
      this.commentEditView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentEditView,
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
    },

    /**
     * The underlying model of the DatumEditView is a Datum.
     */
    model : Datum,
    
    /**
     * Events that the DatumEditView is listening to and their handlers.
     */
    events : {
      "click .add_comment" : 'insertNewComment',

      "click .icon-lock" : "encryptDatum",
      "click .icon-unlock" : "decryptDatum",
      "change" : "updatePouch",
      "click .add_datum_tag" : "insertNewDatumTag",
      "click #duplicate" : "duplicateDatum",
      "click .icon-plus" : "newDatum",
      "change .datum_state_select" : "updateDatumStates",
      "click .LaTeX" : function(){
        this.model.laTeXiT(true);
      },
      "click .icon-paste" : function(){
        this.model.exportAsPlainText(true);
      },
      "click .CSV" : function(){
        this.model.exportAsCSV(true, null, true);
      },
      "click .icon-th-list" : "hideRareFields",
      "click .icon-list-alt" : "showRareFields",
      
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
      
      if (this.format == "well") {
        // Display the DatumEditView
        var jsonToRender = this.model.toJSON();
        jsonToRender.datumStates = this.model.get("datumStates").toJSON();
        $(this.el).html(this.template(jsonToRender));
        
        // Display audioVideo View
        this.audioVideoView.el = this.$(".audio_video");
        this.audioVideoView.render();
        
        // Display the DatumTagsView
        this.datumTagsView.el = this.$(".datum_tags_ul");
        this.datumTagsView.render();
        
        // Display the CommentEditView
        this.commentEditView.el = this.$('.comments');
        this.commentEditView.render();
        
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

      showComments();
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
        
        // Store the current Session, the current corpus, and the current date
        // in the Datum
        this.model.set({
          "session" : app.get("currentSession"),
          "corpusname" : app.get("corpus").get("corpusname"),
          "dateModified" : JSON.stringify(new Date())
        });

        // If this Datum has never been saved
        var neverBeenSaved = false;
        if (!this.model.get("dateEntered")) {
          neverBeenSaved = true;
          
          // Give a dateEntered
          this.model.set("dateEntered", JSON.stringify(new Date()));
        }

        Utils.debug("Saving the Datum");
        var self = this;
        this.model.changeCorpus(app.get("corpus").get("corpusname"), function(){
          self.model.save(null, {
            success : function(model, response) {
              if (neverBeenSaved) {
                // Add it to the default data list
                app.get("corpus").get("dataLists").models[0].get("datumIds").unshift(model.id);
                self.model.changeCorpus(self.model.get("corpusname"), function() {
                  app.get("corpus").get("dataLists").models[0].save();
                  app.get("corpus").save();
                });
                
                // If the default data list is the currently visible data list, re-render it
                if (app.get("corpus").get("dataLists").models[0].cid == app.get("corpus").get("dataLists").models[0].cid) {
                  appView.dataListEditLeftSideView.addOne(model.id, true);
                }
              }
            }
          });
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
      console.log("I'm a new comment!");
      var m = new Comment({
//        "label" : this.$el.children(".comment_input").val(),

      });
      this.model.get("comments").add(m);
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
      appView.datumsView.newDatum();
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
      appView.datumsView.prependDatum(d);
    },
  });

  return DatumEditView;
});
