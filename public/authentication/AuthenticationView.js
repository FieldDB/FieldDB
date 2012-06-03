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
      this.authenticatePreviousUser();
      this.on('all', function(e) {
        this.render();
      });
      this.model.bind('change', this.render);
      
    },
    events : {
      "change" : "render",
      "click .logout": "logout",
      "click .login": "login"
    },
    model : Authentication,
    userView: UserView,
    template : Handlebars.compile(authTemplate),
    el : '#authentication',
    render : function() {
      if(this.model != undefined){
        Handlebars.registerPartial("user", this.userView.template(this.userView.model.toJSON()) );
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
      this.userView.loadSample();
      this.model.set("username",this.model.get("user").get("username"));
      this.render();
      $("#logout").show();
      $("#login").hide();
    },
    authenticatePreviousUser : function() {
      if (localStorage.getItem("user")) {
        var u = JSON.parse(localStorage.getItem("user"));
        u = new User(u);
        this.model.set("user", u);
        this.model.set("username",u.username);
        this.userView.model = u;
        this.render();
        $("#logout").show();
        $("#login").hide();
      }else{
        this.model.set("user", new User());
        console.log("No previous user.");
      }
      this.userView = new UserView({model: this.model.get("user")});
      
    }


  });

  return AuthenticationView;
});