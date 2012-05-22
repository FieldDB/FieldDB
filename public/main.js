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
    "libs/Utils"
], function(DashboardView, DashboardRouter, DatumCollection, ActivityFeed, User, Utils) {
   var Utils = new Utils();
	// Initialize the DashboardView
    window.dashboard = new DashboardView();

    // Initialize the DashboardRouter and start listening for URL changes
    window.router = new DashboardRouter();
    Backbone.history.start();

    // Initialize our list of Datum
    window.datumList = new DatumCollection(); 
    
    //Initialize the user from local storage, or sign in Sapir so they can see the data.
    window.user = new User({"username":"sapir","password":"wharf","firstname":"Ed","lastname":"Sapir"});
    if(localStorage.getItem("user")){
    	window.user = new User(JSON.parse(localStorage.getItem("user")) );
    }else{
    	localStorage.setItem("user",JSON.stringify(user.toJSON() ));
    }
    Utils.addClass(document.getElementById("login"), "hidden");
	Utils.removeClass(document.getElementById("logout"), "hidden");
	
    //Initialize our list of activities
    window.activityFeed = new ActivityFeed();
    
    logout = function(){
    	Utils.removeClass(document.getElementById("login"), "hidden");
    	Utils.addClass(document.getElementById("logout"), "hidden");
    	window.user = null;
    	localStorage.removeItem("user");
    };
    login = function(){
    	window.user = new User({"username": document.getElementById("username").value,"password": document.getElementById("password").value});
    	localStorage.setItem("user",JSON.stringify(user.toJSON()) );
    	Utils.addClass(document.getElementById("login"), "hidden");
    	Utils.removeClass(document.getElementById("logout"), "hidden");
    	
    };
    
    
});
