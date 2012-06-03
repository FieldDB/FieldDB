define("session/SessionView", [
    "use!backbone", 
    "use!handlebars", 
    "session/Session",
    "text!session/session.handlebars",
    "datum/Datum",
    "datum/DatumView"
], function(Backbone, Handlebars, Session, sessionTemplate, Datum, DatumView) {
    var SessionView = Backbone.View.extend(
    /** @lends SessionView.prototype */
    {
        /**
         * @class Session View
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : Session,

        classname : "session",
        el: '#session',
        template: Handlebars.compile(sessionTemplate),
        events:{
        	"click #done": "addDatum" 
        	
        },

        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        
        addDatum : function(){
        	console.log("yay!");
      	    var datumView = new DatumView({model: new Datum()});
         	$("#fullscreen-datum-view").append(datumView.render().el);
         	$("#fullscreen-datum-view").show();

        	return true;
        }
        
    });
    
  

    return SessionView;
}); 