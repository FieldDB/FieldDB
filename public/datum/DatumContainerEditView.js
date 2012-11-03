define([
    "backbone", 
    "handlebars",
    "datum/Datum",
    "datum/Datums",
    "datum/DatumFields",
    "datum/DatumEditView",
    "app/UpdatingCollectionView"
], function(
    Backbone,
    Handlebars,
    Datum,
    Datums,
    DatumFields,
    DatumEditView,
    UpdatingCollectionView
) {
  var DatumContainerEditView = Backbone.View.extend(
  /** @lends DatumContainerEditView.prototype */
  {
    /**
     * @class The area where Datum appear. The number of datum that appear
     * is in UserPreference.
     * 
     * @property {String} format Valid values are "centreWell" or "fullscreen".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      // Create a DatumView
      this.datumsView = new UpdatingCollectionView({
        collection           : this.model,
        childViewConstructor : DatumEditView,
        childViewTagName     : "li",
        childViewClass       : "well",
        childViewFormat      : "well"
      });
      
      // Listen for changes in the number of Datum to display
      app.get("authentication").get("userPrivate").get("prefs").bind("change:numVisibleDatum", this.updateDatums, this); //we might have to bind this in the other direction since the user's preferences are craeted later than the datum container.
    },
    
    /**
     * The underlying model of the DatumContainerEditView is a Datums.
     */
    model: Datums,
    
    /**
     * Events that the DatumContainerEditView is listening to and their handlers.
     */
    events : {
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      "click .icon-book" : "showReadonly"
    },
    
    /** 
     * The Handlebars template rendered as embedded.
     */
    templateEmbedded : Handlebars.templates.datum_container_edit_embedded,
    
    /**
     * The Handlebars template rendered as fullscreen.
     */
    templateFullscreen : Handlebars.templates.datum_container_edit_fullscreen,
    
    render : function() {
      if (this.format == "centreWell") {
        // Display the DatumContainerEditView
        this.setElement($("#datums-embedded"));
        $(this.el).html(this.templateEmbedded({}));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".datum-embedded-ul");
        this.datumsView.render();
        
        //localization of centerWell view
        $(this.el).find(".locale_Show_Fullscreen").attr("title", Locale["locale_Show_Fullscreen"].message);
        
      } else if (this.format == "fullscreen") {
        // Display the DatumContainerEditView
        this.setElement($("#datum-container-fullscreen"));
        $(this.el).html(this.templateFullscreen({}));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".datum-embedded-ul");
        this.datumsView.render();

        //localization of fullscreen view
        $(this.el).find(".locale_Show_in_Dashboard").attr("title", Locale["locale_Show_in_Dashboard"].message);

      }
      //localization for all views
      $(this.el).find(".locale_Data_Entry_Area").html(Locale["locale_Data_Entry_Area"].message);
      $(this.el).find(".locale_Show_Readonly").attr("title", Locale["locale_Show_Readonly"].message);
    },
    
    /**
     * Saves the Datum pages (if necessary) after a timeout.
     */
    saveScreen : function() {
      for (var i in this.datumsView._childViews) {
        this.datumsView._childViews[i].saveScreen();
      }
    },
    
    resizeSmall : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
//      window.app.router.showEditableDatums("centreWell");
      window.location.href = "#render/true";
    },
    
    resizeFullscreen : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.app.router.showEditableDatums("fullscreen");
    },
 
    showReadonly : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.app.router.showReadonlyDatums(this.format);
    },
    
    showMostRecentDatum : function() {
      var nextNumberOfDatum = app.get("authentication").get("userPrivate").get("prefs").get("numVisibleDatum");
        
      // Get the current Corpus' Datum based on their date entered
      var self = this;
      (new Datum({"pouchname": app.get("corpus").get("pouchname")})).getAllIdsByDate(function(rows) {
        // If there are no Datum in the current Corpus
        if ((rows == null) || (rows.length <= 0)) {
          // Remove all currently displayed Datums
          for (var i = 0; i < self.model.length; i++) {
            self.model.pop();
          }
            
          // Add a single, blank Datum
          self.newDatum();
        } else {
          // If the user has increased the number of Datum to display in the container
          if (nextNumberOfDatum > self.model.length) {
            for (var i = 0; i < rows.length; i++) {
              //If you've filled it up, stop filling.
              if(self.model.length >= nextNumberOfDatum){
                return;
              }
              
              // Add the next most recent Datum from the Corpus to the bottom of the stack, if there is one
              if (rows[rows.length - i - 1]) {
                var m = rows[rows.length - i - 1];
                //Only add datum objects to the container
                if(m.value.jsonType == "Datum"){
                  var d = new Datum();
                  d.set(d.parse(m.value));
                  self.model.add(d);
                  
                }
              }
            }
            if(self.model.length == 0){
              self.newDatum();
            }
          // If the user has decreased the number of Datum to display in the container
          } else if (nextNumberOfDatum < self.model.length) {
            // Pop the excess Datum from the bottom of the stack
            for (var i = nextNumberOfDatum; i < self.model.length; i++) {
              self.model.pop();
            }
          }
        }
      });
    },
    
    /**
     * Adds a new Datum to the current Corpus in the current Session.
     */
    newDatum : function() {
      //copy the corpus's datum fields and empty them.
      var datumfields = app.get("corpus").get("datumFields").toJSON();
      for(var x in datumfields){
        datumfields[x].mask = "";
        datumfields[x].value = "";
      }
      this.prependDatum(new Datum({
        datumFields : new DatumFields(datumfields),
        datumStates : app.get("corpus").get("datumStates").clone(),
        pouchname : app.get("corpus").get("pouchname"),
        session : app.get("currentSession")
      }));
    },
    promptedForNewSession : false,
    /**
     * Prepends the given Datum to the top of the Datum stack.
     * Saves and bumps the bottom Datum off the stack, if necessary.
     * 
     * @param {Datm} datum The Datum to prepend.
     */
    prependDatum : function(datum) {
      if (datum.isNew()) {
        // If the corpus' previous Datum is more than 24 hours old,
        // prompt the user if they want to create a new Session.
        var tooOld = false;
          var previousDateModified = window.app.get("corpus").get("dateOfLastDatumModifiedToCheckForOldSession");
          if (previousDateModified) {
            var currentDate = new Date();
            // 86400000 = 24h * 60m * 60s * 1000ms = 1 day 
            if (currentDate - new Date(JSON.parse(previousDateModified)) > 86400000) {
              tooOld = true;
          }
        }
        if(!this.promptedForNewSession){
          if (tooOld && confirm("This session is getting pretty old.\n\nCreate a new session?")) {
            // Display the new Session modal
            window.app.get("corpus").newSession();
            this.promptedForNewSession = true;
            return;
          } 
        }
      // If the datum is already being displayed by the datumContainer
      } else if (this.model.get(datum.id)) {
        // Loop through the currently displayed views
        for (var i in this.datumsView._childViews) {
          var view = this.datumsView._childViews[i];
          if (view.model.id == datum.id) {
            // Save it
            view.saveScreen();
            
            // Remove it
            this.model.remove(view.model);
            
            break;
          }
        }
      }
        
      // Add the new, blank, Datum
      this.model.unshift(datum);
       
      // If there are too many datum on the screen, remove the bottom one and save it, if necessary
      if (this.model.length > app.get("authentication").get("userPrivate").get("prefs").get("numVisibleDatum")) {
        var view = this.datumsView._childViews[this.model.length - 1];
        view.saveScreen();
        this.model.pop();
      }
      //bring the user to the top of the page where the prepended datum is, or show the dashboard if the datums arent showing.
      if($("#datums-embedded").attr("style").indexOf("display: none;") > -1 && $("#datum-container-fullscreen").attr("style").indexOf("display: none;") > -1){
        window.location.href = "#render/true"; 
      }else{
        window.scrollTo(0,0);
        $($($(this.el).find(".utterance")[0]).find(".datum_field_input")[0]).focus()
      }
    }
  });
  
  return DatumContainerEditView;
});
