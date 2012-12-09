define([
    "backbone", 
    "handlebars", 
    "datum/DatumTag",
    "libs/Utils"
], function(Backbone,
    Handlebars, 
    DatumTag
) {
  var DatumTagEditView = Backbone.View.extend(
  /** @lends DatumTagEditView.prototype */
  {
    /**
     * @class Datum Tags
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DATUM TAG EDIT VIEW init");
    },

    /**
     * The underlying model of the DatumTagEditView is a DatumTag.
     */
    model : DatumTag,
    
    /**
     * Events that the DatumTagEditView is listening to and their handlers.
     */
    events : {
      "blur .datum_tag" : "updateTag"
    },

    /**
     * The Handlebars template rendered as the DatumTagEditView.
     */
    template: Handlebars.templates.datum_tag_edit_embedded,
    	
    /**
     * Renders the DatumTagEditView.
     */
    render : function() {
      Utils.debug("DATUM TAG EDIT VIEW render");
      
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updateTag : function() {
      this.model.set("tag", this.$el.children(".datum_tag").val());
    }
  });

  return DatumTagEditView;
}); 