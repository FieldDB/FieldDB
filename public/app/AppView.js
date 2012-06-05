define([ 
    "use!backbone", 
    "use!handlebars", 
    "authentication/Authentication",
    "authentication/AuthenticationView", 
    "corpus/Corpus", 
    "corpus/CorpusView",
    "search/Search", 
    "search/SearchView",
    "datum/Datum",
    "datum/DatumView", 
    "app/App", 
    "app/AppRouter",
    "text!app/app.handlebars", 
    "libs/Utils" 
], function(
    Backbone, 
    Handlebars,
    Authentication, 
    AuthenticationView, 
    Corpus, 
    CorpusView, 
    Search, 
    SearchView,
    Datum,
    DatumView,
    App, 
    AppRouter, 
    appTemplate
) {
  var AppView = Backbone.View.extend(
  /** @lends AppView.prototype */
  {
    /**
     * @class The main layout of the program controls and loads the app. It
     *        allows the user to configure the dashboard by loading their
     *        handlebars. It contains the views of all the core models
     *        referenced in the app model and it will have partial handlebar of
     *        the navigation menu.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      // Render the AppView
      this.render();

      // Create and start the Router
      this.model.router = new AppRouter();
      Backbone.history.start();

      // Create a CorpusView for the Corpus in the App
      this.corpusView = new CorpusView({
        model : this.model.get("corpus")
      });
      
      // Create an AuthenticationView
      this.authView = new AuthenticationView({
        model : new Authentication()
      });
      
      // Create a SearchView
      this.searchView = new SearchView({
        model : new Search()
      });
      
      // Create a DatumView
      this.fullScreenDatumView = new DatumView({
        model : new Datum()
      });
    },

    el : '#app_view',
    
    model : App,
    
    template : Handlebars.compile(appTemplate),
    
    classname : "app_view",
    
    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },

    corpusView : CorpusView,
    
    authView : AuthenticationView,
    
    searchView : SearchView,
    
    fullScreenDatumView : DatumView,
    
    /**
     * This function triggers a sample app to load so that new users can play
     * around and get a feel for the app by seeing the data in context.
     */
    loadSample : function() {
      this.corpusView.loadSample();
      this.authView.loadSample();
      this.searchView.loadSample();
    }
  });

  return AppView;
});
