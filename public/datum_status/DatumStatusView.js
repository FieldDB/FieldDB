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
        events:{
          "blur .datum_status_select" : "render"
        },
       model : DatumStatus,

        classname : "datum_status",

        template: Handlebars.compile(datum_statusTemplate),
        	
        render : function() {
          console.log("\n\n\nrendering "+ $(".datum_status_select").val() );
          
            this.model.set("active", $(".datum_status_select").val() );
            
            $(this.el).html(this.template(this.model.toJSON()));
            
            if( this.model.get("active") == 1){
              $(".datum_status_select").addClass("btn-success");
            }else if( this.model.get("active") == 2 ){
              $(".datum_status_select").addClass("btn-warning");
            }else if( this.model.get("active") == 3 ){
              $(".datum_status_select").addClass("btn-danger");
            }
            return this;
        }
    });

    return DatumStatusView;
}); 