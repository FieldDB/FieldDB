// Set the RequireJS configuration
require.config({
  paths : {
    "use" : "libs/use",
    "text" : "libs/text",
    "jquery" : "libs/jquery",
    "hotkeys" : "libs/jquery.hotkeys",
    "terminal" : "libs/terminal/terminal",
    "underscore" : "libs/underscore",
    "backbone" : "libs/backbone",
    "handlebars" : "libs/handlebars-1.0.0.beta.6",
    "paginator" : "libs/backbone.paginator",
    "crypto" : "libs/Crypto_AES",
    "pouch" : "libs/pouch.alpha"  
  },
  use : {
    "underscore" : {
      attach : "_"
    },

    "backbone" : {
      deps : ["use!underscore", "jquery", "pouch", "libs/backbone-pouchdb", "libs/backbone-couchdb"],
      attach : function(_, $) {
        return Backbone;
      }
    },

    "handlebars" : {
      attach: "Handlebars"
    },
    
    "crypto" :{
    	attach: "CryptoJS"
    },
    
    "paginator":{
      deps : ["use!underscore", "use!backbone", "jquery"],
      attach: "Paginator"
    },

    "hotkeys":{
        deps : ["jquery"],
        attach: "hotkeys"
      },
      
     "terminal":{
       attach: "Terminal"
      }
    
  }
});

// Initialization
require([
    "app/App",
    "app/AppView",
    "app/AppRouter",
    "use!terminal",
    "user/UserWelcomeView",
    "libs/Utils"
], function(
    App,
    AppView,
    AppRouter,
    Terminal,
    UserWelcomeView
) {
  window.loadApp= function(a, callback){
    if (a == null){
      a = new App();
    }
    window.app = a;
    
    // Create and display the AppView
    window.appView = new AppView({model: a}); 
    window.appView.render();
    
    // Start the Router
    app.router = new AppRouter();
    Backbone.history.start();
    
    if(typeof callback == "function"){
      callback();
    }
    
    
  };
  // Load the App from localStorage
  var a = localStorage.getItem("app");
  if (a) {
    Utils.debug("Loading app from localStorage");
    a = JSON.parse(a);
    a = new App(a); 
    window.loadApp(a);
  } else {
    Utils.debug("Loading fresh app");
    // Create a UserWelcomeView modal
    welcomeUserView = new UserWelcomeView();
    welcomeUserView.render();
    $('#user-welcome-modal').modal("show");
  }
  
});
