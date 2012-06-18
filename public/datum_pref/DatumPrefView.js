define( [
    "use!backbone", 
    "use!handlebars", 
    "text!datum_pref/datum_pref.handlebars",
    "datum/DatumField",
    "datum_pref/DatumPref",
    "datum/DatumState",
], function(Backbone,
    Handlebars,  
    datum_prefTemplate,  
    DatumField,
    DatumPref, 
    DatumState) {
    var DatumPrefView = Backbone.View.extend(
    /** @lends DatumFieldView.prototype */
    {
        /**
         * @class Datum Field View
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : DatumPref,

        classname : "datum_prefs",

        template: Handlebars.compile(datum_prefTemplate),
    
        render : function() {
          this.setElement("#datum-preferences-view");
          $(this.el).html(this.template(this.model.toJSON()));
           
          return this;
        }
    });

    return DatumPrefView;
}); 