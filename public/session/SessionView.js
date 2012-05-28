define("session/SessionView", [
    "use!backbone", 
    "use!handlebars", 
    "datum_session/Session",
    "text!session/session.handlebars"
], function(Backbone, Handlebars, Session, sessionTemplate) {
    var SessionView = Backbone.View.extend(
    /** @lends DatumFieldView.prototype */
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

        template: Handlebars.compile(sessionTemplate),
        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return SessionView;
}); 