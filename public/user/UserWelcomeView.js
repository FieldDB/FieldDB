define([
    "use!backbone", 
    "use!handlebars", 
    "text!user/user.handlebars",
    "text!user/user_welcome.handlebars",
    "user/User",
    "user/UserView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    userTemplate, 
    user_welcomeTemplate, 
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
        this.setElement($("#user-welcome-modal"));
        $(this.el).html(this.template(this.model.toJSON()));


      } else {
        Utils.debug("\User model was undefined");
      }

      return this;
    }
  });

  return UserProfileView;
}); 