define([
    "use!backbone", 
    "use!handlebars", 
    "datum/DatumState",
    "text!datum/datum_state_settings.handlebars",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars,
    DatumState,
    datumStateSettingsTemplate
) {
  var DatumStatesView = Backbone.View.extend(
  /** @lends DatumStatesView.prototype */
  {
    /**
     * @class DatumStatesView View
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DatumStatesView init: " + this.el);
      this.model.bind('change', this.render, this);
    },

    model : Backbone.Collection.extend({
      model : DatumState
    }),
    template : Handlebars.compile(datumStateSettingsTemplate),

    render : function() {
      Utils.debug("DatumStatesView render: " + $(this.el).text());

      this.setElement(".datum_state_settings");
      var jsonToRender ={title: "Available Datum States"};
      $(this.el).html(this.template(jsonToRender));

      return this;
    }

  });

  return DatumStatesView;
});