// Set the RequireJS configuration
require.config({
    paths : {
        "use" : "libs/use",
        "text" : "libs/text",
        "jquery" : "libs/jquery",
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
        }
    }
});

// Initialization
require([
    "app/App",
    "app/AppView"
], function(App,AppView) {
    window.app = {};
    app.collections = {};
    app.models = {};
    app.views = {};
    app.mixins = {};
    
    var a = localStorage.getItem("app");
    if (a){
      console.log("Loading app from localStorage");
      a = JSON.parse(a);
      a = new App(a); 
    }else{
      console.log("Loading fresh app");
      a = new App();
    }
    window.appView = new AppView({model: a}); 
    window.app = a;
    window.appView.loadSample();
});
