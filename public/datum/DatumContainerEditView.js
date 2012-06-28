define([
    "use!backbone", 
    "use!handlebars",
    "text!datum/datum_container_edit_embedded.handlebars",
    "datum/Datum",
    "datum/Datums",
    "datum/DatumEditView",
    "app/UpdatingCollectionView"
], function(
    Backbone,
    Handlebars,
    datumContainerTemplate,
    Datum,
    Datums,
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
          datumStates : app.get("corpus").get("datumStates").clone()
        }));
      }
    },
    
    template : Handlebars.compile(datumContainerTemplate),
    
    render : function() {
      // Display the DatumContainerEditView
      this.setElement($("#datums-embedded"));
      $(this.el).html(this.template({}));
      
      // Display the DatumFieldsView
      this.datumsView.el = this.$(".datum-embedded-ul");
      this.datumsView.render();
    },
    
    /**
     * Saves the Datum pages (if necessary) after a timeout.
     */
    saveScreen : function() {
      for (var i in this.datumsView._childViews) {
        this.datumsView._childViews[i].saveScreen();
      }
    }
  });
  
  return DatumContainerEditView;
});
