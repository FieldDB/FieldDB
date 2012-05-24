define("datum_prefs/DatumPrefsView", [
    "use!backbone", 
    "use!handlebars", 
    "datum_prefs/DatumPrefs",
    "datum_field/DatumField",
    "datum_menu/DatumMenu",
    "datum_status/DatumStatus",
    "text!datum_prefs/datum_prefs.handlebars"
], function(Backbone, Handlebars, DatumPrefs, DatumField, DatumMenu,DatumStatus, datum_prefTemplate) {
    var DatumPrefsView = Backbone.View.extend(
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

        model : DatumPrefs,

        classname : "datum_prefs",

        template: Handlebars.compile(datum_prefsTemplate),
        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumPrefsView;
}); 