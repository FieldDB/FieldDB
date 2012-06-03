define([ "use!backbone","use!handlebars",  "authentication/AuthenticationView", "corpus/Corpus",
    "corpus/CorpusView", "search/SearchView", "app/App","app/AppRouter", "text!app/app.handlebars",  "search/SearchView", "libs/Utils" ], function(
    Backbone, Handlebars, AuthenticationView, Corpus, CorpusView, SearchView, App,AppRouter, appTemplate, SearchView) {
  var AppView = Backbone.View.extend(
  /** @lends AppView.prototype */
  {
    /**
     * @class The main layout of the program controls and loads the app. IT
     *        allows the user to configure the dashboard by loading their
     *        handlebars. It contains the views of all the core models
     *        referenced in the app model and it will have partial handlebar of
     *        the navigation menu.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      this.render();
      
      this.router = new AppRouter();
      
      // Start the Router
      Backbone.history.start();
      
      this.corpusView = new CorpusView({ model: this.model.get("corpus") });
      this.authView = new AuthenticationView( {model: this.model.auth } ) ;
      this.searchView = new SearchView( {model: this.model.search } ) ;
      
    },

    el : '#app_view',
    model: App,
    template : Handlebars.compile(appTemplate),
    classname: "app_view",
    router: AppRouter,
    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    
    corpusView: CorpusView,
    authView: AuthenticationView,
    searchView: SearchView
    
    
  });

  return AppView;
});
