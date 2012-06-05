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
    "app/AppView",
    "libs/Utils"
], function(
    App,
    AppView
) {
    var a = localStorage.getItem("app");
    if (a) {
      Utils.debug("Loading app from localStorage");
      a = JSON.parse(a);
      a = new App(a); 
    } else {
      Utils.debug("Loading fresh app");
      a = new App();
    }
    
    window.appView = new AppView({model: a}); 
    window.app = a;
    window.appView.loadSample();
});
