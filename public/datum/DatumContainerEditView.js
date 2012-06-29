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
      
      for (var i = 0; i < app.get("authentication").get("user").get("prefs").get("numVisibleDatum"); i++) {
        this.datums.add(new Datum({
          datumFields : app.get("corpus").get("datumFields").clone(),
          datumStates : app.get("corpus").get("datumStates").clone(),
          datumTags : new DatumTags()
        }));
      }
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
      window.app.router.showDashboard();
    },
    
    resizeFullscreen : function() {
      window.app.router.showFullscreenDatumContainer();
    }
  });
  
  return DatumContainerEditView;
});
