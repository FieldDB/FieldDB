define([
    "use!backbone", 
    "use!handlebars", 
    "text!datum/datum_fields.handlebars",
    "datum/DatumField",
    "datum/DatumFields",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars,
    datumFieldsTemplate,
    DatumField,
    DatumFields
) {
  var DatumFieldsView = Backbone.View.extend(
  /** @lends DatumFieldsView.prototype */
  {
    /**
     * @class DatumFieldsView is rendering the datumFields collections in the
     *        form of editable settings.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DatumFieldsView init: " + this.el);
      // Bind the functions 'add' and 'remove' to the view. 
      _(this).bindAll('add', 'remove');
   
      // Add each datumField to the view
      this.collection.each(this.add);
   
      // Bind this view to the add and remove events of the collection
      this.collection.bind('add', this.add);
      this.collection.bind('remove', this.remove);
    },
    events : {
      "click .add_datum_field" : 'addNewField'
    },
    /**
     * The datumFieldViews array holds all of the children of the
     * DatumFieldView.
     */
    datumFieldViews : [],
    
    /**
     * The Handlebars template rendered as the DatumFieldsView.
     */
    template : Handlebars.compile(datumFieldsTemplate),

    /**
     * Renders the DatumFieldsView and all of its child Views.
     */
    render : function() {
      this._rendered = true;
      Utils.debug("DatumFieldsView render: ");
      
      this.setElement(".datum_fields");
      var jsonToRender = {title: "Available Datum Fields"};
      $(this.el).html(this.template(jsonToRender));
      
      // Render each datumField View and append them.
      _(this.datumFields).each(function(dv) {
        $('.datum_fields').append(dv.render().el);
        dv.delegateEvents();
      });

      return this;
    },
    
    add : function(d) {
      // We create an updating DatumFieldView for each DatumField that is added.
      var dv = new DatumFieldView({
        tagName : 'li',
        className : 'datum_field_li',
        model : d
      });
   
      // And add it to the collection so that it's easy to reuse.
      this.datumFieldViews.push(dv);
   
      // If the view has been rendered, then
      // we immediately append the rendered datumStatus.
      if (this._rendered) {
        $('.datum_fields').append(dv.render().el);
      }
    },
    addNewField : function(){
      var m = new DatumField({"field": this.$el.children(".add_input").val()});
      this.collection.add(m);
    
    },
    remove : function(model) {
      var viewToRemove = _(this.datumFieldViews).select(function(cv) { return cv.model === model; })[0];
      this.datumFieldViews = _(this.datumFieldViews).without(viewToRemove);
   
      if (this._rendered) {
        $(viewToRemove.el).remove();
      }
    }
  });

  return DatumFieldsView;
});