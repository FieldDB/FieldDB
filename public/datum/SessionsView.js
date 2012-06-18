define( [
    "use!backbone", 
    "use!handlebars", 
    "text!sessions/sessions.handlebars",
    "datum/Sessions"
], function(Backbone, Handlebars,sessionsTemplate, Sessions) {
    var SessionsView = Backbone.View.extend(
      /** @lends SessionsView.prototype */
      {
          /**
           * @class This will be a way for users to browse through past sessions.
           * @extends Backbone.View
           * @constructs
           */
      initialize: function () {
      },
      collection: Sessions,
      
      template : Handlebars.compile(sessionsTemplate),

//      render : function() {
//        this.setElement($("#sessions"));
//        $(this.el).html(this.template(this.model.toJSON()));
//        return this;
//      }
    });
    
    return SessionsView;
}); 