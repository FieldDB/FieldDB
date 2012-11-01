define([
    "backbone", 
    "handlebars", 
    "activity/Activity",
    "corpus/Corpus",
    "corpus/Corpuses",
    "corpus/CorpusLinkView",
    "user/User",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    Activity,
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
      Utils.debug("USER EDIT VIEW init: " + this.el);

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

        this.setElement($("#user-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        //localization for public user edit fullscreen
        $(this.el).find(".locale_Public_Profile_Instructions").html(Locale["locale_Public_Profile_Instructions"].message);
        $(this.el).find(".locale_User_Profile").html(Locale["locale_Private_Profile"].message);

        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      } else if(this.format == "modal") {
        Utils.debug("USER EDIT MODAL render: " + this.el);

        this.setElement($("#user-modal"));
        $(this.el).html(this.modalTemplate(this.model.toJSON()));
        
        //localization for user edit modal
        $(this.el).find(".locale_Edit_Public_User_Profile").html(Locale["locale_Edit_Public_User_Profile"].message);
        $(this.el).find(".locale_Private_Profile_Instructions").html(Locale["locale_Private_Profile_Instructions"].message);
        $(this.el).find(".locale_Close").html(Locale["locale_Close"].message);
        $(this.el).find(".locale_User_Profile").html(Locale["locale_Private_Profile"].message);

        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      }else if (this.format == "public") {
        Utils.debug("USER EDIT PUBLIC render: " + this.el);

        this.setElement($("#public-user-page"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        //localization for public user edit fullscreen
        $(this.el).find(".locale_Public_Profile_Instructions").html(Locale["locale_Public_Profile_Instructions"].message);
        $(this.el).find(".locale_User_Profile").html(Locale["locale_Public_Profile"].message);

        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      }
      //localization
      $(this.el).find(".locale_Show_Readonly").attr("title", Locale["locale_Show_Readonly"].message);
    

      $(this.el).find(".locale_Gravatar").html(Locale["locale_Gravatar"].message);
      $(this.el).find(".locale_Gravatar_URL").html(Locale["locale_Gravatar_URL"].message);
      $(this.el).find(".locale_Firstname").html(Locale["locale_Firstname"].message);
      $(this.el).find(".locale_Lastname").html(Locale["locale_Lastname"].message);
      $(this.el).find(".locale_Email").html(Locale["locale_Email"].message);
      $(this.el).find(".locale_Research_Interests").html(Locale["locale_Research_Interests"].message);
      $(this.el).find(".locale_Affiliation").html(Locale["locale_Affiliation"].message);
      $(this.el).find(".locale_Description").html(Locale["locale_Description"].message);
      $(this.el).find(".locale_Corpora").html(Locale["locale_Corpora"].message);
      $(this.el).find(".locale_Save").html(Locale["locale_Save"].message);


      return this;
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
      
      //It is the private self
      if(this.format =="modal"){
        window.app.get("authentication").saveAndEncryptUserToLocalStorage();
        if(window.app.get("currentUserActivityFeed")){
          window.app.get("currentUserActivityFeed").addActivity(
            new Activity({
              verb : "modified",
              directobject : "your private profile",
              indirectobject : "",
              teamOrPersonal : "personal",
              context : "via Offline App"
            }));
        }
        if(window.app.get("currentCorpusTeamActivityFeed")){
          window.app.get("currentCorpusTeamActivityFeed").addActivity(
            new Activity({
              verb : "modified",
              directobject : "<a href='#user/"+this.model._id+"'>their profile</a>",
              indirectobject : "",
              teamOrPersonal : "team",
              context : "via Offline App"
            }));
        }
      }else{
        //It is the public self
        window.app.get("authentication").get("userPrivate").set("publicSelf", this.model);
        this.model.saveAndInterConnectInApp(function(){
          window.app.get("authentication").saveAndEncryptUserToLocalStorage();
        });
        
        window.app.get("currentUserActivityFeed").addActivity(
            new Activity({
              verb : "modified",
              directobject : "<a href='#user/"+this.model._id+"'>your public profile</a>",
              indirectobject : "",
              teamOrPersonal : "personal",
              context : "via Offline App"
            }));
        window.app.get("currentCorpusTeamActivityFeed").addActivity(
            new Activity({
              verb : "modified",
              directobject : "<a href='#user/"+this.model._id+"'>their profile</a>",
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
    },
    changeViewsOfInternalModels : function(){
      //Create a CommentReadView      TODO add comments to users
//      this.commentReadView = new UpdatingCollectionView({
//        collection           : this.model.get("comments"),
//        childViewConstructor : CommentReadView,
//        childViewTagName     : 'li'
//      });
    //Create a CommentReadView     
      this.corpusesReadView = new UpdatingCollectionView({
        collection : new Corpuses(),
        childViewConstructor : CorpusLinkView,
        childViewTagName : 'li'
      });
      this.corpusesReadView.collection.constructCollectionFromArray(this.model
          .get("corpuses"))
    }
  });

  return UserEditView;
}); 