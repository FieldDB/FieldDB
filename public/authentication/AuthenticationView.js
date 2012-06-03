define([ "use!backbone", "use!handlebars",
    "text!authentication/authentication.handlebars",
    "authentication/Authentication" ], function(Backbone, Handlebars,
    authTemplate, Authentication) {
  var AuthenticationView = Backbone.View.extend(
  /** @lends AuthenticationView.prototype */
  {
    /**
     * @class This is the login logout surface.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      this.render();
    },
    events : {
      "change" : "render"
    },
    model : Authentication,
    template : Handlebars.compile(authTemplate),
    el : '#authentication',
    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      console.log("\trendering login ");
      return this;
    }

  });

  return AuthenticationView;
});