define( [
    "use!backbone", 
    "use!handlebars", 
    "datum_pref/DatumPref",
    "datum/DatumField",
    "datum/DatumState",
    "text!datum_pref/datum_pref.handlebars"
], function(Backbone, Handlebars, DatumPref, DatumField, DatumState, datum_prefTemplate) {
    var DatumPrefView = Backbone.View.extend(
    /** @lends DatumFieldView.prototype */
    {
        /**
         * @class Datum Field
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