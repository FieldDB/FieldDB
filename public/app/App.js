define("app/App", [
    "use!backbone",
    "app/AppView", 
    "app/AppRouter", 
    "datum/DatumCollection",
    "activity_feed/ActivityFeed",
    "user/User",
    "authentication/Authentication",
    "libs/Utils",
    "corpus/Corpus",
    "import/Import"
], function(Backbone, AppView, AppRouter, DatumCollection, ActivityFeed, User, Authentication, Utils, Corpus, Import) {
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
            
            // Make our Utils globally available.
            window.Utilities = new Utils();
        	
        	// Start the Router
            Backbone.history.start();
        },

        defaults : {
        
        },
        auth: new Authentication(),
    	user: new User(), //has preferences (skins, colors etc), has hotkeys
    	corpus: new Corpus(), //has search, has datalists, has teams with permissions, has confidentiality_encryption, has datum (which have sessions), (datalists have export)
    	datumList: new DatumCollection(), //TODO remove this later and use corpus instead
    	importer: new Import(),
    	activityFeed: new ActivityFeed(),
    	view: new AppView(),
    	router: new AppRouter()
//    	lexicon: new Lexicon() //has indexes
//    	nav: new Navigation()
//    	glosser: new Glosser() 

    });

    return App;
});
