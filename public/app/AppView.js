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
    "data_list/DataList",
    "data_list/DataListView",
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
    DataList,
    DataListView,
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
      
      // Create a DataListView   
      this.dataListView = new DataListView({
        model : new DataList({
          title : "MyTitle",
          dateCreated : "June 5, 2012",
          description : "MyDescription",
          datumIds : [
            "895CCF1D-80A2-4651-B74C-6A3AFF58B056", 
            "33EE7A7F-45DF-40FD-B847-D46185A2AE0D",
            "895CCF1D-80A2-4651-B74C-6A3AFF58B056", 
            "33EE7A7F-45DF-40FD-B847-D46185A2AE0D",
            "895CCF1D-80A2-4651-B74C-6A3AFF58B056", 
            "33EE7A7F-45DF-40FD-B847-D46185A2AE0D",
            "895CCF1D-80A2-4651-B74C-6A3AFF58B056", 
            "33EE7A7F-45DF-40FD-B847-D46185A2AE0D"
          ]
        })
      });
      
      // Render the AppView
      this.render();
    },

    el : '#app_view',
    
    model : App,
    
    template : Handlebars.compile(appTemplate),
    
    classname : "app_view",
    
    render : function() {
      // Display the app
      $(this.el).html(this.template(this.model.toJSON()));
      
      // Display the Data List View
      this.dataListView.render();
      
      return this;
    },

    corpusView : CorpusView,
    
    authView : AuthenticationView,
    
    searchView : SearchView,
    
    fullScreenDatumView : DatumView,
    
    dataListView : DataListView,
    
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
