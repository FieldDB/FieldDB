define("datum/DatumView", [
    "use!backbone", 
    "use!handlebars", 
    "datum/Datum",
    "text!datum/datum.handlebars",
    "text!datum_status/datum_status.handlebars",
    "datum_status/DatumStatus",
], function(Backbone, Handlebars, Datum, datumTemplate, datum_statusTemplate, DatumStatus) {
    var DatumView = Backbone.View.extend(
    /** @lends DatumView.prototype */
    {
        /**
         * @class The layout of a single Datum. It contains a datum status.   
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
        render : function() {
        	Handlebars.registerPartial("datum_status", this.datstattemplate(this.datumstatus.toJSON()) );
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumView;
}); 