define( [
    "use!backbone", 
    "use!handlebars", 
    "datum/DatumState",
    "text!datum/datum_state.handlebars"
], function(Backbone, Handlebars, DatumStatus, datum_stateTemplate) {
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
//          "blur .datum_state_select" : "render"
        },
        model : DatumStatus,

        classname : "datum_state",

        template: Handlebars.compile(datum_stateTemplate),
        	
        render : function() {
          console.log("\n\n\nrendering "+ $(".datum_state_select").val() );
//          var id = $(".datum_state_select").val() ;
//            this.model.set("active", id );
//            var s = this.model.get("states");
//            s[id].selected = "selected";
//            
//            $(this.el).html(this.template(this.model.toJSON()));
//            
//            if( id == 0){
//              $(".datum_state_select").addClass("btn-success");
//            }else if( id == 1 ){
//              $(".datum_state_select").addClass("btn-warning");
//            }else if( id == 2 ){
//              $(".datum_state_select").addClass("btn-danger");
//            }
//            return this;
        }
    });

    return DatumStatusView;
}); 