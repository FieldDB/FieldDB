define([
    "use!backbone", 
    "use!handlebars", 
    "text!user/user.handlebars",
    "text!user/user_welcome.handlebars",
    "corpus/CorpusesView",
    "user/User",
    "user/UserView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    userTemplate, 
    user_welcomeTemplate, 
    CorpusesView,
    User, 
    UserView
) {
  var UserProfileView = Backbone.View.extend(
  /** @lends UserProfileView.prototype */
  {
    /**
     * @class The UserProfileView shows information about the user, normal
     *        information such as username, research interests affiliations etc,
     *        but also a list of their corpora which will allow their friends to
     *        browse their corpora, and also give them a quick way to navigate
     *        between corpora.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("USER init: " + this.el);

      this.model.bind("change", this.render, this);

      // Create a CorpusesView
      if(this.model.get("corpuses") == undefined){
        this.model.set("corpuses", []);
      }
      this.corpusesView = new CorpusesView({
        array : this.model.get("corpuses")
      });
    },

    /**
     * The underlying model of the UserProfileView is a User.
     */
    model : User,
    
    /**
     * Events that the UserProfileView is listening to and their handlers.
     */
    events : {
      "click .sync_sapir_data" : function() {
        console.log("hiding user welcome, syncing sapir");
        this.$el.hide();//TODO @trisapeace please code review this, how was it hiding the modal before?
        window.appView.loadSample();
      },
      "click .sync_my_data" : function(){
        console.log("hiding user welcome, syncing users data");
        this.$el.hide();
      }
    },

    /**
     * The corpusesView is a child of the CorpusView.
     */
    corpusesView : CorpusesView,

    /**
     * The Handlebars template rendered as the UserProfileView
     */
    template : Handlebars.compile(user_welcomeTemplate),

    /**
     * The Handlebars template of the user header, which is used as a partial.
     */
    usertemplate : Handlebars.compile(userTemplate),

    /**
     * Renders the UserProfileView and its partial.
     */
    render : function() {
      Utils.debug("USER render: " + this.el);

      if (this.model != undefined) {
        // Register the partial
        Handlebars.registerPartial("user", this.usertemplate(this.model
            .toJSON()));

        // Display the UserProfileView
        this.setElement($("#welcome-user-view"));
        $(this.el).html(this.template(this.model.toJSON()));

        // Display the CorpusesView
        this.corpusesView.render();

      } else {
        Utils.debug("\User model was undefined");
      }

      return this;
    }
  });

  return UserProfileView;
}); 