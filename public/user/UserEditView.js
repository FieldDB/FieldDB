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
      Utils.debug("USER EDIT VIEW init: " + this.el);

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
     * The underlying model of the UserEditView is a User, or a UserMask.
     */
//    model : User,
    
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
          e.preventDefault();
        }
        this.showReadVersion();
        
      },
      "click .edit-public-user-profile" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }        
        $("#user-modal").modal("hide");
        window.app.router.showFullscreenUser();
        window.appView.publicEditUserView.render();
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
//      Utils.debug("USER render: " + this.el);

      if (this.model == undefined) {
        Utils.debug("\User model was undefined");
        return this;
      }
      if (this.format == "fullscreen") {
        Utils.debug("USER EDIT FULLSCREEN render: " + this.el);

        this.setElement($("#public-user-page"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        //localization for public user edit fullscreen
        $(this.el).find(".locale_Public_Profile_Instructions").html(chrome.i18n.getMessage("locale_Public_Profile_Instructions"));

      } else if(this.format == "modal") {
        Utils.debug("USER EDIT MODAL render: " + this.el);

        this.setElement($("#user-modal"));
        $(this.el).html(this.modalTemplate(this.model.toJSON()));
        
        //localization for user edit modal
        $(this.el).find(".locale_Edit_Public_User_Profile").html(chrome.i18n.getMessage("locale_Edit_Public_User_Profile"));
        $(this.el).find(".locale_Private_Profile_Instructions").html(chrome.i18n.getMessage("locale_Private_Profile_Instructions"));
        $(this.el).find(".locale_Close").html(chrome.i18n.getMessage("locale_Close"));

      }
      //localization
      $(this.el).find(".locale_Show_Readonly").attr("title", chrome.i18n.getMessage("locale_Show_Readonly"));
      $(this.el).find(".locale_User_Profile").html(chrome.i18n.getMessage("locale_User_Profile"));
      $(this.el).find(".locale_Gravatar").html(chrome.i18n.getMessage("locale_Gravatar"));
      $(this.el).find(".locale_Gravatar_URL").html(chrome.i18n.getMessage("locale_Gravatar_URL"));
      $(this.el).find(".locale_Firstname").html(chrome.i18n.getMessage("locale_Firstname"));
      $(this.el).find(".locale_Lastname").html(chrome.i18n.getMessage("locale_Lastname"));
      $(this.el).find(".locale_Email").html(chrome.i18n.getMessage("locale_Email"));
      $(this.el).find(".locale_Research_Interests").html(chrome.i18n.getMessage("locale_Research_Interests"));
      $(this.el).find(".locale_Affiliation").html(chrome.i18n.getMessage("locale_Affiliation"));
      $(this.el).find(".locale_Description").html(chrome.i18n.getMessage("locale_Description"));
      $(this.el).find(".locale_Corpora").html(chrome.i18n.getMessage("locale_Corpora"));
      $(this.el).find(".locale_Save").html(chrome.i18n.getMessage("locale_Save"));

        // Display the CorpusesView
//        this.corpusesView.render();

    },
    saveProfile : function(){
      Utils.debug("Saving user");
      
      this.model.set("firstname", $(this.el).find(".firstname").val());
      this.model.set("lastname", $(this.el).find(".lastname").val());
      this.model.set("email", $(this.el).find(".email").val());
      this.model.set("researchInterest", $(this.el).find(".researchInterest").val());
      this.model.set("affiliation", $(this.el).find(".affiliation").val());
      this.model.set("description", $(this.el).find(".description").val());
      this.model.set("gravatar", $(this.el).find(".gravatar").val());
      
      if(this.format =="modal"){
        window.app.get("authentication").saveAndEncryptUserToLocalStorage();
        window.app.get("authentication").get("userPrivate").get("activities").unshift(
            new Activity({
              verb : "modified",
              directobject : "their profile",
              indirectobject : "",
              teamOrPersonal : "personal",
              context : "via Offline App"
            }));
      }else{
        window.app.get("authentication").get("userPrivate").set("publicSelf", this.model);
        this.model.saveAndInterConnectInApp(function(){
          window.app.get("authentication").saveAndEncryptUserToLocalStorage();
        });
        
        window.app.get("authentication").get("userPrivate").get("activities").unshift(
            new Activity({
              verb : "modified",
              directobject : "their profile",
              indirectobject : "",
              teamOrPersonal : "team",
              context : "via Offline App"
            }));
      }
      
      window.appView.toastUser("Sucessfully saved your profile.","alert-success","Saved!");

      this.showReadVersion();
    },
    showReadVersion : function(){
      if(this.format == "modal"){
        window.appView.modalReadUserView.render();
//        $("#user-modal").modal("hide");
      }else{
        window.appView.publicReadUserView.render();
      }
    },
    updateGravatar : function(){
      this.model.set("gravatar", $(this.el).find(".gravatar").val());
      $(this.el).find(".gravatar").attr("src",$(this.el).find(".gravatar").val());
    }
  });

  return UserEditView;
}); 