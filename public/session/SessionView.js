define("session/SessionView", [
    "use!backbone", 
    "use!handlebars", 
    "session/Session",
    "text!session/session.handlebars"
], function(Backbone, Handlebars, Session, sessionTemplate) {
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

        template: Handlebars.compile(sessionTemplate),
        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return SessionView;
}); 