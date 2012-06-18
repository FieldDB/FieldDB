define( [
    "use!backbone", 
    "use!handlebars", 
    "text!datum/sessions.handlebars",
    "datum/Session",
    "datum/Sessions"
], function(Backbone, Handlebars,sessionsTemplate,Session, Sessions) {
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
      model : Session,
      
      template : Handlebars.compile(sessionsTemplate),

      render : function() {
      
        this._rendered = true;
        Utils.debug("SessionsView render: ");
        
        this.setElement("#sessions");
        var jsonToRender = {title: "Available Sessions"};
        $(this.el).html(this.template(jsonToRender));    
        return this;

      }
    });
    
    return SessionsView;
}); 