define("session/SessionView", [
    "use!backbone", 
    "use!handlebars", 
    "session/Session",
    "text!session/session.handlebars",
    "datum/Datum",
    "datum/DatumView",
    "user/Users",
    "user/UsersView"
], function(Backbone, Handlebars, Session, sessionTemplate, Datum, DatumView, Users, UsersView) {
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
          this.users = new Users();
          usersView = new UsersView({model: this.users});
        },

        model : Session,

        classname : "session",
        el: '#session',
        template: Handlebars.compile(sessionTemplate),
        usersView: UsersView,
        users: Users,
        events:{
//        	"click #done": "addDatum" 
        	
        },
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        loadSample: function(){
          
        }
        
    });
    
  

    return SessionView;
}); 