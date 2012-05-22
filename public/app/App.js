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
            window.Utils = new Utils();
        	
            Backbone.history.start();

            // Initialize our list of Datum
            window.datumList = new DatumCollection(); 
            
            window.login = this.auth.login;
            window.logout = this.auth.logout;
        },

        defaults : {
        
        },
        auth: new Authentication(),
    	user: new User(), //has preferences (skins, colors etc), has hotkeys
    	corpus: new Corpus(), //has search, has datalists, has teams with permissions, has confidentiality_encryption, has datum (which have sessions), (datalists have export)
    	datumList: new DatumCollection(), //TODO remove this later and use corpus instead
    	import: new Import(),
    	activityFeed: new ActivityFeed(),
    	view: new AppView(),
    	router: new AppRouter()
//    	lexicon: new Lexicon() //has indexes
//    	nav: new Navigation()
//    	glosser: new Glosser() 

    });

    return App;
});
