define("app/App", [
    "use!backbone",
    "app/AppView", 
    "app/AppRouter", 
    "datum/Datums",
    "activity_feed/ActivityFeed",
    "user/User",
    "authentication/Authentication",
    "corpus/Corpus",
    "import/Import",
    "lexicon/Lexicon"
], function(Backbone, AppView, AppRouter, Datums, ActivityFeed, User, Authentication, Corpus, Import, Lexicon) {
    var App = Backbone.Model.extend(
    /** @lends App.prototype */
    {
        /**
		 * @class The App handles the renitialization and loading of the app
		 *        depending on which platform (Android, Chrome, web) the app is
		 *        running, who is logged in etc.
		 * 
		 * The App should be serializable to save state to local storage for the
		 * next run.
		 * 
		 * @property {Corpus} corpus The corpus is a Corpus object which will
		 *           permit access to the datum, and the data lists. The corpus
		 *           feeds the search object with indexes and fields for
		 *           advanced search, the corpus has datalists, has teams with
		 *           permissions, has a confidentiality_encryption key, it's
		 *           datum have sessions, its datalists have export.
		 * @property {Glosser} glosser The glosser listens to
		 *           orthography/utterence lines and attempts to guess the
		 *           gloss.
		 * @property {Lexicon} lexicon The lexicon is a list of morphemes,
		 *           allomorphs and glosses which are used to index datum, and
		 *           also to gloss datum.
		 * @property {User} user The user is a User object (User, Bot or
		 *           Informant) which is logged in and viewing the app with that
		 *           user's perspective. To check whether some data is
		 *           public/viewable/editable the app.user should be used to
		 *           verify the permissions. If no user is logged in a special
		 *           user "public" is logged in and used to calculate
		 *           permissions.
		 * 
		 * 
		 * @property {ActivityFeed} activityFeed The activityFeed is an Activity
		 *           Feed object which attaches itself to a div.
		 * @property {Authentication} auth The auth member variable is an
		 *           Authentication object permits access to the login and
		 *           logout functions, and the database of users depending on
		 *           whether the app is online or not.
		 * @property {Import} importer The importer is an Importer object which
		 *           attaches itself to the document page on Chrome Extensions
		 *           and non-mobile browsers to listen to drag and drop events
		 *           and attempt to import the contents of the dragged and
		 *           dropped files. On android the app will have to import data
		 *           via the menus.
		 * @property {Search} search The search is the primary surface where the
		 *           global search features will attach.
		 * @property
		 * @extends Backbone.Model
		 * @constructs
		 */
        initialize : function() {
            this.bind('error', function(model, error) {
                console.log("Error in Activity Feed Item: "+ error);
            });
        	
        	// Start the Router
            Backbone.history.start();
            
            // Populate datumList from Pouch
            //TODO remove this later and use corpus instead
            this.datumList = new Datums();
            this.datumList.fetch();
        },
        defaults : {
        	corpus: new Corpus("corpus"), 
//        	glosser: new Glosser(lexicon),
    		lexicon: new Lexicon(""), //has indexes, stored in local storage
        	user: new User("user") //has preferences (skins, colors etc), has hotkeys
        },
        activityFeed: new ActivityFeed("activity_feed"),
        auth: new Authentication("authentication"),
        importer: new Import(),
        view: new AppView(),
    	router: new AppRouter()
//      nav: new Navigation(),
//    	search: new Search("global_search")
    });

    return App;
});
