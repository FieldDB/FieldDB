define([
    "backbone",
    "handlebars",
    "corpus/Corpus",
    "corpus/Corpuses",
    "corpus/CorpusLinkView",
    "user/User",
    "app/UpdatingCollectionView",
    "OPrime"
], function(
    Backbone,
    Handlebars,
    Corpus,
    Corpuses,
    CorpusLinkView,
    User,
    UpdatingCollectionView
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
      if (OPrime.debugMode) OPrime.debug("USER EDIT VIEW init: " + this.el);

      this.changeViewsOfInternalModels();

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
        this.$el.hide();
      },
      "click .save-user-profile" : "saveProfile",
      "blur .email" : "updateGravatar",
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
        $("#user-modal").hide();
        window.app.router.showFullscreenUser();
        window.appView.publicEditUserView.render();
      }

    },

    /**
     * The corporaView is a child of the CorpusView.
     */
//    corporaView : CorpusesView, //TODO put this in as an updating collection

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
     if (OPrime.debugMode) OPrime.debug("USER EDIT render: ");

      if (this.model == undefined) {
        if (OPrime.debugMode) OPrime.debug("\User model was undefined");
        return this;
      }

      var jsonToRender = this.model.toJSON();
      jsonToRender.locale_Affiliation = Locale.get("locale_Affiliation");
      jsonToRender.locale_Close = Locale.get("locale_Close");
      jsonToRender.locale_Corpora = Locale.get("locale_Corpora");
      jsonToRender.locale_Description = Locale.get("locale_Description");
      jsonToRender.locale_Edit_Public_User_Profile = Locale.get("locale_Edit_Public_User_Profile");
      jsonToRender.locale_Email = Locale.get("locale_Email");
      jsonToRender.locale_Firstname = Locale.get("locale_Firstname");
      jsonToRender.locale_Gravatar = Locale.get("locale_Gravatar");
      jsonToRender.locale_Gravatar_URL = Locale.get("locale_Gravatar_URL");
      jsonToRender.locale_Lastname = Locale.get("locale_Lastname");
      jsonToRender.locale_Private_Profile_Instructions = Locale.get("locale_Private_Profile_Instructions");
      jsonToRender.locale_Public_Profile_Instructions = Locale.get("locale_Public_Profile_Instructions");
      jsonToRender.locale_Research_Interests = Locale.get("locale_Research_Interests");
      jsonToRender.locale_Save = Locale.get("locale_Save");
      jsonToRender.locale_Show_Readonly = Locale.get("locale_Show_Readonly");
      jsonToRender.locale_User_Profile = Locale.get("locale_Private_Profile");
      jsonToRender.locale_User_Profile = Locale.get("locale_Public_Profile");

      if (this.format == "fullscreen") {
        this.setElement($("#user-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(jsonToRender));
      } else if(this.format == "modal") {
        this.setElement($("#user-modal"));
        $(this.el).html(this.modalTemplate(jsonToRender));
      }else if (this.format == "public") {
        this.setElement($("#public-user-page"));
        $(this.el).html(this.fullscreenTemplate(jsonToRender));
      }

      // Display the CorpusesReadView
      this.corporaReadView.el = $(this.el).find('.corpora');
      this.corporaReadView.render();

      return this;
    },
    saveProfile : function(){
      if (OPrime.debugMode) OPrime.debug("Saving user");

      this.model.set("firstname", $(this.el).find(".firstname").val());
      this.model.set("lastname", $(this.el).find(".lastname").val());
      var email = $(this.el).find(".email").val();
      this.model.set("email", email);
      this.model.set("gravatar", this.model.getGravatar(email));
      this.model.set("researchInterest", $(this.el).find(".researchInterest").val());
      this.model.set("affiliation", $(this.el).find(".affiliation").val());
      this.model.set("description", $(this.el).find(".description").val());
      // this.model.set("gravatar", $(this.el).find(".gravatar").val());

      //It is the private self
      if(this.format =="modal"){
        window.app.get("authentication").saveAndEncryptUserToLocalStorage();
        window.app.addActivity(
            {
              verb : "modified",
              directobject : "your private profile",
              indirectobject : "",
              teamOrPersonal : "personal",
              context : "via Offline App"
            });
        window.app.addActivity(
            {
              verb : "modified",
              directobject : "<a href='#user/"+this.model._id+"'>their profile</a>",
              indirectobject : "",
              teamOrPersonal : "team",
              context : "via Offline App"
            });
      }else{
        //It is the public self
        window.app.get("authentication").get("userPrivate").set("publicSelf", this.model);
        this.model.saveAndInterConnectInApp(function(){
          window.app.get("authentication").saveAndEncryptUserToLocalStorage();
        });

        window.app.addActivity(
            {
              verb : "modified",
              directobject : "<a href='#user/"+this.model._id+"'>your public profile</a>",
              indirectobject : "",
              teamOrPersonal : "personal",
              context : "via Offline App"
            });
        window.app.addActivity(
            {
              verb : "modified",
              directobject : "<a href='#user/"+this.model._id+"'>their profile</a>",
              indirectobject : "",
              teamOrPersonal : "team",
              context : "via Offline App"
            });
      }

      window.appView.toastUser("Sucessfully saved your profile.","alert-success","Saved!");

      this.showReadVersion();
    },
    showReadVersion : function(){
      if(this.format == "modal"){
        window.appView.modalReadUserView.render();
//        $("#user-modal").hide();
      }else{
        window.appView.publicReadUserView.render();
      }
    },
    updateGravatar : function(){
      var email = $(this.el).find(".email").val();
      var gravatar = this.model.getGravatar(email);
      this.model.set("gravatar", gravatar);
      $(this.el).find(".gravatar-image").attr("src", "https://secure.gravatar.com/avatar/"+gravatar+"?d=identicon");
    },
    changeViewsOfInternalModels : function(){
      //Create a CommentReadView      TODO add comments to users
//      this.commentReadView = new UpdatingCollectionView({
//        collection           : this.model.get("comments"),
//        childViewConstructor : CommentReadView,
//        childViewTagName     : 'li'
//      });
    //Create a CommentReadView
      var corpora = new Corpuses();
      try {
        corpora = new Backbone.Collection(JSON.parse(localStorage.getItem(
          this.model.get("username") + "corporaUserHasAccessTo")));
      } catch (e) {
        console.log("Couldn't load the list of corpora which the user has access to.");
      }
      this.corporaReadView = new UpdatingCollectionView({
        collection : corpora,
        childViewConstructor : CorpusLinkView,
        childViewTagName : 'li'
      });

    }
  });

  return UserEditView;
});
