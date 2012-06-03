define([ 
         "use!backbone", 
         "use!handlebars",
         "text!authentication/authentication.handlebars",
         "authentication/Authentication",
         "user/User",
         "user/UserView"], function(
             Backbone, 
             Handlebars,
             authTemplate, 
             Authentication,
             User,
             UserView) {
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
      this.on('all', function(e) {
        this.render();
      });
      this.model.bind('change', this.render);
      this.render();
    },
    events : {
      "change" : "render",
      "click .logout": "logout",
      "click .login": "login"
    },
    model : Authentication,
    template : Handlebars.compile(authTemplate),
    el : '#authentication',
    render : function() {
      if(this.model != undefined){
        $(this.el).html(this.template(this.model.toJSON()));
        console.log("\trendering login: "+ this.model.get("username"));
      }else{
        console.log("\tLogin model was undefined.");
      }
      return this;
    },
    logout: function(){
      this.model.logout();
      this.render();
      $("#logout").hide();
      $("#login").show();
    },
    login: function(){
      this.model.login(document.getElementById("username").value, document.getElementById("password").value);
      this.render();
      $("#logout").show();
      $("#login").hide();
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
      this.render();
      $("#logout").show();
      $("#login").hide();

    }

  });

  return AuthenticationView;
});