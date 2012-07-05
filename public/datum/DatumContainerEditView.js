define([
    "use!backbone", 
    "use!handlebars",
    "text!datum/datum_container_edit_embedded.handlebars",
    "text!datum/datum_container_edit_fullscreen.handlebars",
    "datum/Datum",
    "datum/Datums",
    "datum/DatumEditView",
    "datum/DatumTags",
    "app/UpdatingCollectionView"
], function(
    Backbone,
    Handlebars,
    datumContainerEmbeddedTemplate,
    datumContainerFullscreenTemplate,
    Datum,
    Datums,
    DatumEditView,
    DatumTags,
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
      this.datums = new Datums();
      
      // Create a DatumTagView
      this.datumsView = new UpdatingCollectionView({
        collection           : this.datums,
        childViewConstructor : DatumEditView,
        childViewTagName     : "li",
        childViewClass       : "well"
      });
      
      this.updateDatums();
      
      // Listen for changes in the number of Datum to display
      app.get("authentication").get("userPrivate").get("prefs").bind("change:numVisibleDatum", this.updateDatums, this);
    },
    
    events : {
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen"
    },
    
    templateEmbedded : Handlebars.compile(datumContainerEmbeddedTemplate),
    
    templateFullscreen : Handlebars.compile(datumContainerFullscreenTemplate),
    
    render : function() {
      if (this.format == "centreWell") {
        // Display the DatumContainerEditView
        this.setElement($("#datums-embedded"));
        $(this.el).html(this.templateEmbedded({}));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".datum-embedded-ul");
        this.datumsView.render();
      } else if (this.format == "fullscreen") {
        // Display the DatumContainerEditView
        this.setElement($("#datum-container-fullscreen"));
        $(this.el).html(this.templateFullscreen({}));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".datum-embedded-ul");
        this.datumsView.render();
      }
    },
    
    /**
     * Saves the Datum pages (if necessary) after a timeout.
     */
    saveScreen : function() {
      for (var i in this.datumsView._childViews) {
        this.datumsView._childViews[i].saveScreen();
      }
    },
    
    resizeSmall : function() {
      this.format = "centreWell";
      this.render();
      window.app.router.showDashboard();
    },
    
    resizeFullscreen : function() {
      this.format = "fullscreen";
      this.render();
      window.app.router.showFullscreenDatumContainer();
    },
    
    updateDatums : function() {
      var previousNumberOfDatum = this.datums.length;
      var nextNumberOfDatum = app.get("authentication").get("userPrivate").get("prefs").get("numVisibleDatum");
        
      // TODO Get the current Corpus' Datum based on their date entered
      
      // TODO If there are no Datum in the current Corpus
      if (true) {
        // Remove all currently displayed Datums
        for (var i = 0; i < previousNumberOfDatum; i++) {
          this.datums.pop();
        }
          
        // Add a single, blank Datum
        this.prependDatum(new Datum({
          datumFields : app.get("corpus").get("datumFields").clone(),
          datumStates : app.get("corpus").get("datumStates").clone()
        }));
      } else {
        // If the user has increased the number of Datum to display in the container
        if (nextNumberOfDatum > previousNumberOfDatum) {
          for (var i = previousNumberOfDatum; i < nextNumberOfDatum; i++) {
            // TODO Add the next most recent Datum from the Corpus to the bottom of the stack, if there is one
          }
        // If the user has decrease the number of Datum to display in the container
        } else if (nextNumberOfDatum < previousNumberOfDatum) {
          // Pop the excess Datum from the bottom of the stack
          for (var i = nextNumberOfDatum; i < previousNumberOfDatum; i++) {
            this.datums.pop();
          }
        }
      }
    },
    
    /**
     * Adds a new Datum to the current Corpus in the current Session.
     */
    newDatum : function() {
      this.prependDatum(new Datum({
        datumFields : app.get("corpus").get("datumFields").clone(),
        datumStates : app.get("corpus").get("datumStates").clone()
      }));
    },
    
    /**
     * Prepends the given Datum to the top of the Datum stack.
     * Saves and bumps the bottom Datum off the stack, if necessary.
     * 
     * @param {Datm} datum The Datum to preprend.
     */
    prependDatum : function(datum) {
      // TODO If the corpus' previous Datum is more than 24 hours old,
      // prompt the user if they want to create a new Session.
      
      // Set the Datum's Session to the current Session
      datum.set("session", app.get("currentSession")); 
      
      // Add the new, blank, Datum
      this.datums.add(datum, {at:0});
       
      // If there are too many datum on the screen, remove the bottom one and save it.
      if (this.datums.length > app.get("authentication").get("userPrivate").get("prefs").get("numVisibleDatum")) {
        var d = this.datums.pop();
        console.log("Removed the datum with id: " + d._id);
        d.save();
      }
    }
  });
  
  return DatumContainerEditView;
});
