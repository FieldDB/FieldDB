define([
    "use!backbone", 
    "use!handlebars", 
    "datum/DatumState",
    "datum/DatumStates",
    "datum/DatumStateEditView",
    "text!datum/datum_states_settings.handlebars",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars,
    DatumState,
    DatumStates,
    DatumStateEditView,
    datumStateSettingsTemplate
) {
  var DatumStatesView = Backbone.View.extend(
  /** @lends DatumStatesView.prototype */
  {
    /**
     * @class DatumStatesView is rendering the datumstates collections in the form of editable settings.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DatumStatesView init: " + this.el);
      // Bind the functions 'add' and 'remove' to the view. 
      _(this).bindAll('add', 'remove');
   
      // Add each datumState to the view
      this.collection.each(this.add);
   
      // Bind this view to the add and remove events of the collection
      this.collection.bind('add', this.add);
      this.collection.bind('remove', this.remove);
    },
    events : {
      "click .add_datum_state" : 'addNewState'
    },
    /**
     * The datumStateViews array holds all of the children of the
     * DatumStatesView.
     */
    datumStateViews : [],
    
    /**
     * The Handlebars template rendered as the DatumStatesView.
     */
    template : Handlebars.compile(datumStateSettingsTemplate),

    /**
     * Renders the DatumStatesView and all of its child Views.
     */
    render : function() {
      this._rendered = true;
      Utils.debug("DatumStatesView render: ");
      
      this.setElement(".datum_state_settings");
      var jsonToRender = {title: "Available Datum States"};
      $(this.el).html(this.template(jsonToRender));
      
      // Render each datumState View and append them.
      _(this.datumStateViews).each(function(dv) {
        $('.edit_datum_states').append(dv.render().el);
        dv.delegateEvents();
      });

      return this;
    },
    
    add : function(d) {
      // We create an updating DatumStateView for each DatumState that is added.
      var dv = new DatumStateEditView({
        tagName : 'li',
        className : 'datum_state_li',
        model : d
      });
   
      // And add it to the collection so that it's easy to reuse.
      this.datumStateViews.push(dv);
   
      // If the view has been rendered, then
      // we immediately append the rendered datumStatus.
      if (this._rendered) {
        $('.edit_datum_states').append(dv.render().el);
      }
    },
    addNewState : function(){
      var m = new DatumState({"state": this.$el.children(".add_input").val(), "color": this.$el.children(".add_color_chooser").val() })
      this.collection.add(m);
    
    },
    remove : function(model) {
      var viewToRemove = _(this.datumStateViews).select(function(cv) { return cv.model === model; })[0];
      this.datumStateViews = _(this.datumStateViews).without(viewToRemove);
   
      if (this._rendered) {
        $(viewToRemove.el).remove();
      }
    }
  });

  return DatumStatesView;
});