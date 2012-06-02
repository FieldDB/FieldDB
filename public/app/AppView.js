define([ "use!backbone","use!handlebars", "authentication/AuthenticationView",
    "corpus/CorpusView", "search/SearchView", "app/App","app/AppRouter", "text!app/app.handlebars", "libs/Utils" ], function(
    Backbone, Handlebars, AuthenticationView, CorpusView, SearchView, App,AppRouter, appTemplate) {
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
      this.corpusView = new CorpusView({model: this.model.get("corpus"), el: $('#corpus')});
      console.log("Corpus title" + this.model.get("corpus").get("name") );
      
      this.render();
      $("#corpus").append(this.corpusView.render().el);
      this.router = new AppRouter();
      
      // Start the Router
      Backbone.history.start();
    },

    el : $('#app_view'),

    events : {
    },
    
    model: App,
    template : Handlebars.compile(appTemplate),
    classname: "app_view",
    router: AppRouter,
    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    
    corpusView: CorpusView
    
    
  });

  return AppView;
});
