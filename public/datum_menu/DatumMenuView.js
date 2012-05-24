define("datum_menu/DatumMenuView", [
    "use!backbone", 
    "use!handlebars", 
    "datum_menu/DatumMenu",
    "text!datum_menu/datum_menu.handlebars"
], function(Backbone, Handlebars, DatumMenu, datum_menuTemplate) {
    var DatumStatusView = Backbone.View.extend(
    /** @lends DatumMenuView.prototype */
    {
        /**
         * @class The Datum Menu.
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : DatumMenu,

        classname : "datum_menu",

        template: Handlebars.compile(datum_menuTemplate),
        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumMenuView;
}); 


