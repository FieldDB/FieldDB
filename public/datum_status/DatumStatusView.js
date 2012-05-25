define("datum_status/DatumStatusView", [
    "use!backbone", 
    "use!handlebars", 
    "datum_status/DatumStatus",
    "text!datum_status/datum_status.handlebars"
], function(Backbone, Handlebars, DatumStatus, datum_statusTemplate) {
    var DatumStatusView = Backbone.View.extend(
    /** @lends DatumStatusView.prototype */
    {
        /**
         * @class The status of a single Datum.
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

     //  model : DatumStatus,

        classname : "datum_status",

        template: Handlebars.compile(datum_statusTemplate),
        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumStatusView;
}); 


