define([
    "backbone",
    "handlebars",
    "datum/Datum",
    "datum/Datums",
    "datum/DatumReadView",
    "app/UpdatingCollectionView"
], function(
    Backbone,
    Handlebars,
    Datum,
    Datums,
    DatumReadView,
    UpdatingCollectionView
) {
  var DatumContainerReadView = Backbone.View.extend(
  /** @lends DatumContainerReadView.prototype */
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
      // Create a DatumTagView
      this.datumsView = new UpdatingCollectionView({
        collection           : this.model,
        childViewConstructor : DatumReadView,
        childViewTagName     : "li",
        childViewClass       : "well",
        childViewFormat      : "well"
      });

      // Listen for changes in the number of Datum to display
      app.get("authentication").get("userPrivate").get("prefs").bind("change:numVisibleDatum", this.updateDatums, this); //we might have to bind this in the other direction since the user's preferences are craeted later than the datum container.
    },

    model : Datums,

    events : {
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      "click .icon-edit" : "showEditable"
    },

    templateEmbedded : Handlebars.templates.datum_container_read_embedded,

    templateFullscreen : Handlebars.templates.datum_container_read_fullscreen,

    render : function() {

      var jsonToRender = this.model.toJSON();
      jsonToRender.locale_Data_Entry_Area = Locale.get("locale_Data_Entry_Area");
      jsonToRender.locale_Edit_Datum = Locale.get("locale_Edit_Datum");
      jsonToRender.locale_Show_Fullscreen = Locale.get("locale_Show_Fullscreen");
      jsonToRender.locale_Show_in_Dashboard = Locale.get("locale_Show_in_Dashboard");

      // Display the DatumContainerReadView
      if (this.format == "centreWell") {
        this.setElement($("#datums-embedded"));
        $(this.el).html(this.templateEmbedded(jsonToRender));
      } else if (this.format == "fullscreen") {
        this.setElement($("#datum-container-fullscreen"));
        $(this.el).html(this.templateFullscreen(jsonToRender));
      }

      // Display the DatumFieldsView
      this.datumsView.el = this.$(".datum-embedded-ul");
      this.datumsView.render();

      return this;
    },

    resizeSmall : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
//      window.app.router.showReadonlyDatums("centreWell");
      window.location.href = "#render/true";
    },

    resizeFullscreen : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.app.router.showReadonlyDatums("fullscreen");
    },

    showEditable : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.app.router.showEditableDatums(this.format);
    },

    showMostRecentDatum : function() {
      var nextNumberOfDatum = app.get("authentication").get("userPrivate").get("prefs").get("numVisibleDatum");

      // Get the current Corpus' Datum based on their date entered
      var self = this;
      (new Datum({"dbname": app.get("corpus").get("dbname")})).getMostRecentIdsByDate(nextNumberOfDatum ,function(rows) {
        // If there are no Datum in the current Corpus
        if ((rows == null) || (rows.length <= 0)) {
          // Remove all currently displayed Datums
          for (var i = 0; i < self.model.length; i++) {
            self.model.pop();
          }

          // Add a single, blank Datum
//          self.newDatum();
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
                var value = m;
                /* The format returned by the backbone couchdb adaptor is different (TODO re-look into this to remember what was different) than a pure couchdb result */
                if(!OPrime.isBackboneCouchDBApp()){
                  value = m.value;
                  var d = new Datum();
                  d.set(d.parse(value));
                  value = d;
                }
                //Only add datum objects to the container
                if(value.jsonType == "Datum"){
                  self.model.add(value);
                }
              }
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
    }
  });

  return DatumContainerReadView;
});
