define([
    "use!backbone", 
    "use!handlebars", 
    "text!user/user_welcome_modal.handlebars",
    "user/User",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    user_welcomeTemplate, 
    User
) {
  var UserEditView = Backbone.View.extend(
  /** @lends UserEditView.prototype */
  {
    /**
     * @class The UserEditView shows information about the user, normal
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
     * The underlying model of the UserEditView is a User.
     */
    model : User,
    
    /**
     * Events that the UserEditView is listening to and their handlers.
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
     * The Handlebars template rendered as the UserEditView
     */
    template : Handlebars.compile(user_welcomeTemplate),


    /**
     * Renders the UserEditView and its partial.
     */
    render : function() {
      Utils.debug("USER render: " + this.el);

      if (this.model != undefined) {
       
        // Display the UserEditView
        this.setElement($("#user-welcome-modal"));
        $(this.el).html(this.template(this.model.toJSON()));


      } else {
        Utils.debug("\User model was undefined");
      }

      return this;
    }
  });

  return UserEditView;
}); 