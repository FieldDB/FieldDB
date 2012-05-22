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
    "datum/DatumCollection",
    "activity_feed/ActivityFeed",
    "user/User",
    "authentication/Authentication",
    "libs/Utils"
], function(DashboardView, DashboardRouter, DatumCollection, ActivityFeed, User, Authentication, Utils) {
	window.Utils = new Utils();
	// Initialize the DashboardView
    window.dashboard = new DashboardView();

    // Initialize the DashboardRouter and start listening for URL changes
    window.router = new DashboardRouter();

    // Initialize our list of Datum
    window.datumList = new DatumCollection(); 
    
    //Initialize the user from local storage, or sign in as the default: Sapir so they can see the data.
    window.auth = new Authentication();
    window.auth.authenticatePreviousUser();
    
    //Initialize our list of activities
    window.activityFeed = new ActivityFeed();
    
    logout = window.auth.login;
    logout = window.auth.logout;
    
    
});
