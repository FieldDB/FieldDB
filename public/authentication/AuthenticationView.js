define([ 
         "use!backbone", 
         "use!handlebars",
         "text!authentication/authentication.handlebars",
         "authentication/Authentication",
         "user/User"], function(
             Backbone, 
             Handlebars,
             authTemplate, 
             Authentication,
             User) {
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
      console.log("\trendering login: "+ this.model.get("username"));
      return this;
    },
    loadSample : function() {
      this.model.set("user", new User({
        "username" : "sapir",
        "password" : "wharf",
        "firstname" : "Ed",
        "lastname" : "Sapir"
      }));
      this.model.set("username","sapir");
      if (localStorage.getItem("user")) {
        this.model.set("user", new User(JSON.parse(localStorage.getItem("user"))));
      } else {
        localStorage.setItem("user", JSON.stringify(this.model.get("user").toJSON()));
      }
      $("#logout").show();
      $("#login").hide();

    }

  });

  return AuthenticationView;
});