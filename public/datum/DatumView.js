define("datum/DatumView", [
    "use!backbone", 
    "use!handlebars", 
    "datum/Datum",
    "text!datum/datum.handlebars",
    "text!datum_status/datum_status.handlebars",
    "text!datum_menu/datum_menu.handlebars",
    "datum_status/DatumStatus",
    "datum_menu/DatumMenu",
    "datum_menu/DatumMenuView"
], function(Backbone, Handlebars, Datum, datumTemplate, datum_statusTemplate,datum_menuTemplate, DatumStatus,DatumMenu,DatumMenuView) {
    var DatumView = Backbone.View.extend(
    /** @lends DatumView.prototype */
    {
        /**
         * @class The layout of a single Datum. It contains a datum status, datumFields, datumTags and a datum menu.
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : Datum,

        classname : "datum",

        template: Handlebars.compile(datumTemplate),
        datumstatus: new DatumStatus(),
        datstattemplate: Handlebars.compile(datum_statusTemplate),
        
        //I attempted to put in a partial for datum menu unsuccessfully.
        menuview: new DatumMenuView({model: new DatumMenu()}),
        
        render : function() {
        	Handlebars.registerPartial("datum_status", this.datstattemplate(this.datumstatus.toJSON()) );
        	//this is where i was!! 
        	Handlebars.registerPartial("datum_menu", this.menuview.template(this.menuview.model.toJSON()) );

        	//Handlebars.registerPartial("datum_menu", this.menuview.get("template")(this.menuview.get("model").toJSON()) );
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumView;
}); 