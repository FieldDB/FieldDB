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
      app.get("authentication").get("user").get("prefs").bind("change:numVisibleDatum", this.updateDatums, this);
    },
    
    events : {
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      "click .icon-plus" : "newDatum"
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
      var nextNumberOfDatum = app.get("authentication").get("user").get("prefs").get("numVisibleDatum");
      
      if (nextNumberOfDatum > previousNumberOfDatum) {
        for (var i = previousNumberOfDatum; i < nextNumberOfDatum; i++) {
          this.datums.add(new Datum({
            datumFields : app.get("corpus").get("datumFields").clone(),
            datumStates : app.get("corpus").get("datumStates").clone(),
            datumTags : new DatumTags()
          }));
        }
      } else if (nextNumberOfDatum < previousNumberOfDatum) {
        for (var i = nextNumberOfDatum; i < previousNumberOfDatum; i++) {
          this.datums.pop();
        }
      }
    },
    
    /**
     * Adds a new Datum to the current Corpus in the current Session. It is
     * placed at the top of the datumsView, pushing off the bottom Datum, if
     * necessary.
     */
    newDatum : function() {
      console.log("Adding a new datum");
      
      // Add the new, blank, Datum
      this.datums.add(new Datum({
        datumFields : app.get("corpus").get("datumFields").clone(),
        datumStates : app.get("corpus").get("datumStates").clone(),
        datumTags : new DatumTags()
      }), {at:0});
      
      // If there are too many datum on the screen, remove the bottom one and save it.
      if (this.datums.length > app.get("authentication").get("user").get("prefs").get("numVisibleDatum")) {
        var d = this.datums.pop();
        console.log("Removed the datum with gloss: " + d.get("datumFields").models[3].get("value"));
        d.save();
      }
      
      return false;
    }
  });
  
  return DatumContainerEditView;
});
