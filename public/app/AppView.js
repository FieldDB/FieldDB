define([ 
    "use!backbone", 
    "use!handlebars",
    "corpus/Corpus", 
    "corpus/CorpusView",
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
    Corpus, 
    CorpusView,
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
     * @description Starts the application and initializes all its children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("APP init: " + this.el);
      
      // Create and start the Router
      this.model.router = new AppRouter();
      Backbone.history.start();
      
      // Create a CorpusView for the Corpus in the App
      this.corpusView = new CorpusView({
        model : this.model.get("corpus")
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
    },
    
    /**
     * The underlying model of the AppView is an App.
     */
    model : App,
    
    /**
     * The corpusView is a child of the AppView.
     */
    corpusView : null,
    
    /**
     * The fullScreenDatumView is a child of the AppView.
     */
    fullScreenDatumView : DatumView,
    
    /**
     * The dataListView is a child of the AppView.
     */
    dataListView : DataListView,
    
    /**
     * The Handlebars template rendered as the AppView.
     */
    template : Handlebars.compile(appTemplate),
    
    /**
     * Renders the AppView and all of its child Views.
     */
    render : function() {
      Utils.debug("APP render: " + this.el);
      if (this.model != undefined) {
        // Display the AppView
        this.setElement($("#app_view"));
        $(this.el).html(this.template(this.model.toJSON()));
        
        // Display the CorpusView
        this.corpusView.render();
        
        // Display the DatumView
        this.fullScreenDatumView.render();
        
        // Display the DataListView
        this.dataListView.render();
      } else {
        Utils.debug("\tApp model is not defined");
      }
      
      return this;
    },
    
    /**
     * This function triggers a sample app to load so that new users can play
     * around and get a feel for the app by seeing the data in context.
     */
    loadSample : function() {
      this.corpusView.loadSample();
    }
  });

  return AppView;
});
