define("datum/DatumView", [
    "use!backbone", 
    "use!handlebars", 
    "datum/Datum",
    "text!datum/datum.handlebars",
    "text!datum_status/datum_status.handlebars",
    "text!datum_menu/datum_menu.handlebars",
    "datum_status/DatumStatus",
    "datum_status/DatumStatusView",
    "datum_menu/DatumMenu",
    "datum_menu/DatumMenuView",
    "datum_tag/DatumTag",
    "datum_tag/DatumTagView",
    "datum_field/DatumField",
    "datum_field/DatumFieldView"
], function(Backbone, Handlebars, Datum, datumTemplate, datum_statusTemplate,datum_menuTemplate, DatumStatus,DatumStatusView, DatumMenu,DatumMenuView,DatumTag, DatumTagView, DatumField, DatumFieldView) {
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
        
        statusview: new DatumStatusView({model: new DatumStatus()}),    
        menuview: new DatumMenuView({model: new DatumMenu()}),
        tagview: new DatumTagView({model: new DatumTag()}),
        fieldview: new DatumFieldView({model: new DatumField()}),


        
        render : function() {
        	Handlebars.registerPartial("datum_status", this.statusview.template(this.statusview.model.toJSON()) );
        	Handlebars.registerPartial("datum_menu", this.menuview.template(this.menuview.model.toJSON()) );
        	Handlebars.registerPartial("datum_tag", this.tagview.template(this.tagview.model.toJSON()) );
        	Handlebars.registerPartial("datum_field", this.fieldview.template(this.fieldview.model.toJSON()) );


            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumView;
}); 