define([ "use!backbone","use!handlebars", "authentication/AuthenticationView",
    "corpus/CorpusView", "search/SearchView", "app/App","text!app/app.handlebars", "libs/Utils" ], function(
    Backbone, Handlebars, AuthenticationView, CorpusView, SearchView, App, appTemplate) {
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
    },

    el : $('#app_view'),

    events : {
    },
    
    model: App,
    template : Handlebars.compile(appTemplate),
    classname: "app_view",
    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    
  });

  return AppView;
});
