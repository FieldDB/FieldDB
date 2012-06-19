// Set the RequireJS configuration
require.config({
  paths : {
    "use" : "libs/use",
    "text" : "libs/text",
    "jquery" : "libs/jquery",
    "hotkeys" : "libs/jquery.hotkeys",
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
      }
  }
});

// Initialization
require([
    "app/App",
    "app/AppView",
    "app/AppRouter",
    "libs/Utils"
], function(
    App,
    AppView,
    AppRouter
) {
  // Load the App
  var a = localStorage.getItem("app");
  if (a) {
    Utils.debug("Loading app from localStorage");
    a = JSON.parse(a);
    a = new App(a); 
  } else {
    Utils.debug("Loading fresh app");
    a = new App();
  }
  window.app = a;
  
  // Create and display the AppView
  window.appView = new AppView({model: a}); 
  window.appView.render();
  
  // Start the Router
  app.router = new AppRouter();
  Backbone.history.start();
  
  // Load the sample App
  window.appView.loadSample();
});
