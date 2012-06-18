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
     * @class DatumStatesView is rendering the datumstates colections in the form of editable settings.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DatumStatesView init: " + this.el);
      // bind the functions 'add' and 'remove' to the view.
      _(this).bindAll('add', 'remove');
      
      //trying to capture events
      _.bindAll(this, 'alertit');
      
      // create an array of datumState views to keep track of children
      this._datumStateViews = [];
   
      // add each datumState to the view
      this.collection.each(this.add);
   
      // bind this view to the add and remove events of the collection!
      this.collection.bind('add', this.add);
      this.collection.bind('remove', this.remove);
    },
    events : {
      // "change" : "render",
      "click .color_chooser" : "alertit",
      "blur input.datum_state_input" : "alertit"
    },
    add : function(d) {
      // We create an updating donut view for each donut that is added.
      var dv = new DatumStateEditView({
        tagName : 'li',
        model : d
      });
   
      // And add it to the collection so that it's easy to reuse.
      this._datumStateViews.push(dv);
   
      // If the view has been rendered, then
      // we immediately append the rendered datumStatus.
      if (this._rendered) {
        $(this.el).append(dv.render().el);
      }
    },
    remove : function(model) {
      var viewToRemove = _(this._datumStateViews).select(function(cv) { return cv.model === model; })[0];
      this._donutViews = _(this._datumStateViews).without(viewToRemove);
   
      if (this._rendered) $(viewToRemove.el).remove();
    },
//    collection: DatumStates,
    template : Handlebars.compile(datumStateSettingsTemplate),

    render : function() {
      this._rendered = true;
      Utils.debug("DatumStatesView render: ");
      
      this.setElement(".datum_state_settings");
      $(this.el).empty();
      var jsonToRender ={title: "Available Datum States"};
      $(this.el).html(this.template(jsonToRender));
      
   // Render each datumState View and append them.
      _(this._datumStateViews).each(function(dv) {
        $('.edit_datum_states').append(dv.render().el);
      });
      
      

      return this;
    },
    alertit: function(e){
     console.log(e);
   // update each datumState View and append them.
      _(this._datumStateViews).each(function(dv) {
        
        dv.updateState(e);
      });
      alert("updating states in datumstates view");
    }

  });

  return DatumStatesView;
});