define( [
    "backbone", 
    "handlebars", 
    "datum/DatumStates",
    "libs/OPrime"
], function(
    Backbone, 
    Handlebars, 
    DatumStates
) {
  var DatumStatesReadView = Backbone.View.extend(
  /** @lends DatumStatesReadView.prototype */
  {
    /**
     * @class The DatumStatesReadView is a select dropdown which lets the user choose a datum state
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      OPrime.debug("DATUM STATES READ VIEW init");
      
      // If the model changes, re-render
      this.collection.bind('change', this.render, this);
    },
    
    /**
     * The underlying collection of the DatumStatesReadView is  DatumStates.
     */
    collection : DatumStates,
    
    /**
     * Events that the DatumStatesReadView is listening to and their handlers.
     */
    events : {
    },

    /**
     * The Handlebars template rendered as the DatumStateSettingsReadView.
     */
    template : Handlebars.templates.datum_states_view,
      
    /**
     * Renders the DatumStatesReadView.
     */
    render : function() {
      OPrime.debug("DATUM STATES READ VIEW render");
      var jsonToRender = {};
      alert("TODO check this");
      jsonToRender.datumStates = this.collection.toJSON();
      $(this.el).html(this.template(jsonToRender));

      return this;
    }
  });

  return DatumStatesReadView;
}); 
