define( [
    "use!backbone", 
    "use!handlebars", 
    "text!datum/datum_state_settings.handlebars",
    "datum/DatumState"
], function(
    Backbone, 
    Handlebars, 
    datum_stateTemplate,
    DatumState 
  ) {
      var DatumStateEditView = Backbone.View.extend(
      /** @lends DatumStateEditView.prototype */
      {
        /**
         * @class DatumStateEditView
         * 
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
          _.bindAll(this, 'contentChanged');
        },
        events : {
          // "change" : "render",
          "click .color_chooser" : "alertit",
          "blur input.datum_state_input" : "updateState"
        },
        model : DatumState,

        template : Handlebars.compile(datum_stateTemplate),

        render : function() {
          // this.setElement();
          $(this.el).empty();
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        },
        alertit : function() {
          alert("clicked in datum state edit view");
        },
        contentChanged : function(e) {
          console.log(e);
        },
        updateState : function(e) {
          this.model.set("state", $(".datum_state_input").val());
          this.model.set("color", $(".color_chooser").val());
          console.log(this.model.toJSON());
          this.render();
        },
      });

      return DatumStateEditView;
    });