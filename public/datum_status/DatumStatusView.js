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
//          "blur .datum_status_select" : "render"
        },
        model : DatumStatus,

        classname : "datum_status",

        template: Handlebars.compile(datum_statusTemplate),
        	
        render : function() {
          console.log("\n\n\nrendering "+ $(".datum_status_select").val() );
          var id = $(".datum_status_select").val() ;
            this.model.set("active", id );
            var s = this.model.get("statuses");
            s[id].selected = "selected";
            
            $(this.el).html(this.template(this.model.toJSON()));
            
            if( id == 0){
              $(".datum_status_select").addClass("btn-success");
            }else if( id == 1 ){
              $(".datum_status_select").addClass("btn-warning");
            }else if( id == 2 ){
              $(".datum_status_select").addClass("btn-danger");
            }
            return this;
        }
    });

    return DatumStatusView;
}); 