define("datum/DatumView", [
    "use!backbone", 
    "use!handlebars", 
    "datum/Datum",
    "text!datum/datum.handlebars",
    "datum_status/DatumStatus",
    "datum_status/DatumStatusView",
    "datum_menu/DatumMenu",
    "datum_menu/DatumMenuView",
    "datum_tag/DatumTag",
    "datum_tag/DatumTagView",
    "datum_field/DatumField",
    "datum_field/DatumFieldView"
], function(Backbone, Handlebars, Datum, datumTemplate, DatumStatus,DatumStatusView, DatumMenu,DatumMenuView,DatumTag, DatumTagView, DatumField, DatumFieldView) {
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
        	this.statusview = new DatumStatusView({model: this.model.get("status")});
            this.menuview = new DatumMenuView({model: this.model.get("datumMenu")});
            this.tagview = new DatumTagView({model: this.model.get("datumTag")});
            this.fieldview = new DatumFieldView({model: this.model.get("datumField")});
         

        },

        model : Datum,

        classname : "datum",

        template: Handlebars.compile(datumTemplate),
        
        statusview: null,  
        menuview: null,
        tagview: null,
        fieldview: null,
        
        events:{
        	"click #new": "newDatum"
        	
        },

        render : function() {
        	Handlebars.registerPartial("datum_status", this.statusview.template(this.statusview.model.toJSON()) );
        	Handlebars.registerPartial("datum_menu", this.menuview.template(this.model.toJSON()) );
        	Handlebars.registerPartial("datum_tag", this.tagview.template(this.tagview.model.toJSON()) );
        	Handlebars.registerPartial("datum_field", this.fieldview.template(this.model.toJSON()) );


            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        
        newDatum: function() {
        	/* First, we build a new datum model, 
        	 * this datum model then asks if it belongs to a session
        	 * if it belongs to a session it goes ahead and renders a new datum
        	 * if it does not belong to a session, it builds a new session and renders a new session view.
        	 * after the new session is sent to pouch, then a new datumview can be rendered.
             */
        	
//        	var newDatum = new DatumView({model: new Datum()});
//         	$("#extended-datum-view").append(newDatum.render().el);
//         	var sID = this.newDatum.get("sessionID");
//         	console.log(sID);
//      	
//         	if(newDatum.sessionID == 0){
//         		var newSession = new SessionView({model: new Session()});
//             	$("#new-session-view").append(newSession.render().el);
//
//         	}
        	
      	  console.log("I'm a new datum!");
      	  return true;
         }
        
    });

    return DatumView;
}); 