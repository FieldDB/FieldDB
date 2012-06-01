// Set the RequireJS configuration
require.config({
    paths : {
        "use" : "libs/use",
        "text" : "libs/text",
        "jquery" : "libs/jquery",
        "underscore" : "libs/underscore",
        "backbone" : "libs/backbone",
        "handlebars" : "libs/handlebars-1.0.0.beta.6",
        "crypto" : "libs/Crypto_AES",
        "pouch" : "libs/pouch.alpha"
    },
    use : {
        "underscore" : {
            attach : "_"
        },
        
        "pouch" : {
            attach : "Pouch"
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
        }
    }
});

// Initialization
require([
    "use!backbone",
    "app/App"
], function(Backbone, App) {
    window.app = new App();
    
});
