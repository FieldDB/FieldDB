define([
    "backbone", 
    "handlebars", 
    "activity/Activity",
    "user/User",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    Activity,
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
     * @property {String} format Must be set when the view is initialized. Valid
     *           values are "modal" and "fullscreen".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("USER init: " + this.el);

//      this.model.bind("change", this.render, this); //this breaks the save. we should only render the corpus updating collection view.

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
      },
      "click .save-user-profile" : "saveProfile",
      "blur .gravatar" : "updateGravatar",
      "click .icon-book" : function(e){
        if(e){
          e.stopPropagation();
        }
        window.appView.modalReadUserView.render();
      }

    },

    /**
     * The corpusesView is a child of the CorpusView.
     */
//    corpusesView : CorpusesView, //TODO put this in as an updating collection

    /**
     * The Handlebars template rendered as the UserModalEditView
     */
    modalTemplate : Handlebars.templates.user_edit_modal,
    
    /** 
     * The Handlebars template rendered as the UserFullscreenEditView
     */
    fullscreenTemplate : Handlebars.templates.user_edit_fullscreen,

    /**
     * Renders the UserEditView depending on its format.
     */
    render : function() {
      Utils.debug("USER render: " + this.el);

      if (this.model == undefined) {
        Utils.debug("\User model was undefined");
        return this;
      }
      if (this.format == "fullscreen") {
        this.setElement($("#user-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
      } else if(this.format == "modal") {
        this.setElement($("#user-modal"));
        $(this.el).html(this.modalTemplate(this.model.toJSON()));
      }
      //localization
      $(".locale_User_Profile").html(chrome.i18n.getMessage("locale_User_Profile"));
      $(".locale_Email").html(chrome.i18n.getMessage("locale_Email"));
      $(".locale_Research_Interests").html(chrome.i18n.getMessage("locale_Research_Interests"));
      $(".locale_Affiliation").html(chrome.i18n.getMessage("locale_Affiliation"));
      $(".locale_Description").html(chrome.i18n.getMessage("locale_Description"));
      $(".locale_Corpora").html(chrome.i18n.getMessage("locale_Corpora"));
      $(".locale_Gravatar").html(chrome.i18n.getMessage("locale_Gravatar"));
      $(".locale_Gravatar_URL").html(chrome.i18n.getMessage("locale_Gravatar_URL"));
      $(".locale_Firstname").html(chrome.i18n.getMessage("locale_Firstname"));
      $(".locale_Lastname").html(chrome.i18n.getMessage("locale_Lastname"));
      $(".locale_Show_Readonly").attr("title", chrome.i18n.getMessage("locale_Show_Readonly"));

        // Display the CorpusesView
//        this.corpusesView.render();

    },
    saveProfile : function(){
      Utils.debug("Saving user");
      window.appView.modalReadUserView.render();

      $("#user-modal").modal("hide");
      
      this.model.set("firstname", $(this.el).find(".firstname").val());
      this.model.set("lastname", $(this.el).find(".lastname").val());
      this.model.set("email", $(this.el).find(".email").val());
      this.model.set("researchInterest", $(this.el).find(".researchInterest").val());
      this.model.set("affiliation", $(this.el).find(".affiliation").val());
      this.model.set("description", $(this.el).find(".description").val());
      this.model.set("gravatar", $(this.el).find(".gravatar").val());
      window.app.get("authentication").get("userPublic").set("gravatar", $(this.el).find(".gravatar").val());
      window.app.get("authentication").saveAndEncryptUserToLocalStorage();
      window.appView.renderEditableUserViews();
      window.appView.renderReadonlyUserViews();
      window.app.get("authentication").get("userPrivate").get("activities").unshift(
          new Activity({
            verb : "modified",
            directobject : "their profile",
            indirectobject : "",
            context : "via Offline App",
            user: window.app.get("authentication").get("userPublic")
          }));
      window.appView.toastUser("Sucessfully saved your profile.","alert-success","Saved!");

    },
    updateGravatar : function(){
      this.model.set("gravatar", $(this.el).find(".gravatar").val());
      $(this.el).find(".gravatar").attr("src",$(this.el).find(".gravatar").val());
    }
  });

  return UserEditView;
}); 