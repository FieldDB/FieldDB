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
        "jquery.couch" : "libs/jquery.couch"
    },
    use : {
        "underscore" : {
            attach : "_"
        },

        "backbone" : {
            deps : ["use!underscore", "jquery", "jquery.couch", "libs/backbone-couchdb"],
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
    // CouchDB configuration
    Backbone.couch_connector.config.base_url = "https://trisapeace.iriscouch.com"
    Backbone.couch_connector.config.db_name = "datum_test";
    // If set to true, the connector will listen to the changes feed
    // and will provide your models with real time remote updates.
    // But in this case we enable the changes feed for each Collection on our own.
    Backbone.couch_connector.config.global_changes = false;

    window.app = new App();
});
