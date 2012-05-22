define("app/App", [
    "use!backbone",
    "app/AppView", 
    "app/AppRouter", 
    "datum/DatumCollection",
    "activity_feed/ActivityFeed",
    "user/User",
    "authentication/Authentication",
    "libs/Utils"
], function(Backbone, AppView, AppRouter, DatumCollection, ActivityFeed, User, Authentication, Utils) {
    var App = Backbone.Model.extend(
    /** @lends App.prototype */
    {
        /**
         * @class The App handles the renitialization and loading of the app depending on which platform (Android, Chrome, web) the app is running, who is logged in etc.  
         * 
         * @extends Backbone.Model
         * @constructs
         */
        initialize : function() {
            this.bind('error', function(model, error) {
                console.log("Error in Activity Feed Item: "+ error);
            });
            window.Utils = new Utils();
        	// Initialize the AppView
            window.app = new AppView();

            // Initialize the AppRouter and start listening for URL changes
            window.router = new AppRouter();
            Backbone.history.start();

            // Initialize our list of Datum
            window.datumList = new DatumCollection(); 
            
            //Initialize the user from local storage, or sign in as the default: Sapir so they can see the data.
            window.auth = new Authentication();
            window.auth.authenticatePreviousUser();
            
            //Initialize our list of activities
            window.activityFeed = new ActivityFeed();
            
            window.login = window.auth.login;
            window.logout = window.auth.logout;
        },

        defaults : {
        	
        }

    });

    return App;
});
