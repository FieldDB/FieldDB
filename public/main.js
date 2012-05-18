// Set the RequireJS configuration
require.config({
    paths : {
        "use" : "libs/use",
        "text" : "libs/text",
        "jquery" : "libs/jquery",
        "underscore" : "libs/underscore",
        "backbone" : "libs/backbone",
        "handlebars" : "libs/handlebars-1.0.0.beta.6"
    },
    use : {
        "underscore" : {
            attach : "_"
        },

        "backbone" : {
            deps : ["use!underscore", "jquery"],
            attach : function(_, $) {
                return Backbone;
            }
        },
        
        "handlebars" : {
            attach: "Handlebars"
        }
    }
});

// Initialization
require([
    "dashboard/DashboardView", 
    "dashboard/DashboardRouter", 
    "datum/DatumCollection"
], function(DashboardView, DashboardRouter, DatumCollection) {
    // Initialize the DashboardView
    window.dashboard = new DashboardView();

    // Initialize the DashboardRouter and start listening for URL changes
    window.router = new DashboardRouter();

    // Initialize our list of Datum
    window.datumList = new DatumCollection(); 
});
