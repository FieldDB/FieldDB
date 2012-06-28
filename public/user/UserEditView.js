define([
    "use!backbone", 
    "use!handlebars", 
    "text!user/user_edit_fullscreen.handlebars",
    "text!user/user_edit_modal.handlebars",
    "user/User",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    userFullscreenTemplate, 
    userModalTemplate, 
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

      //TODO replace this code with a Updating Collections View
      
      // Create a CorpusesView
//      if(this.model.get("corpuses") == undefined){
//        this.model.set("corpuses", []);
//      }
//      this.corpusesView = new CorpusesView({
//        array : this.model.get("corpuses")
//      });
    },

    /**
     * The underlying model of the UserEditView is a User.
     */
    model : User,
    
    /**
     * Events that the UserEditView is listening to and their handlers.
     */
    events : {
      "click #close_user_profile" : function() {
        console.log("hiding user profile");
        this.$el.modal("hide");
      }
    },

    /**
     * The corpusesView is a child of the CorpusView.
     */
//    corpusesView : CorpusesView,

    /**
     * The Handlebars template rendered as the UserEditView
     */
    modalTemplate : Handlebars.compile(userModalTemplate),

    /**
     * The Handlebars template of the user header, which is used as a partial.
     */
    fullscreemTemplate : Handlebars.compile(userFullscreenTemplate),

    /**
     * Renders the UserEditView and its partial.
     */
    render : function() {
      Utils.debug("USER render: " + this.el);

      if (this.model != undefined) {
        

        // Display the UserEditView
        this.setElement($("#user-modal"));
        $(this.el).html(this.modalTemplate(this.model.toJSON()));

        // Display the CorpusesView
  //      this.corpusesView.render();

      } else {
        Utils.debug("\User model was undefined");
      }

      return this;
    }
  });

  return UserEditView;
}); 