// TODO Make this a read-only version. Right now, this is just a copy of the Editable version

define([
    "backbone", 
    "handlebars", 
    "datum/DatumTag",
    "OPrime"
], function(Backbone,
    Handlebars, 
    DatumTag
) {
  var DatumTagReadView = Backbone.View.extend(
  /** @lends DatumTagReadView.prototype */
  {
    /**
     * @class Datum Tags
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("DATUM TAG EDIT VIEW init");
    },

    model : DatumTag,
    
    events : {
      "blur .datum_tag" : "updateTag"
    },

    template: Handlebars.templates.datum_tag_read_embedded,
    	
    render : function() {
      if (OPrime.debugMode) OPrime.debug("DATUM TAG EDIT VIEW render");
      
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    },
    
    /**
     * Change the model's state.
    @Deprecated
     */
    updateTag : function() {
      this.model.set("tag", this.$el.children(".datum_tag").val());
    }
  });

  return DatumTagReadView;
}); 