define([ 
    "backbone", 
    "handlebars", 
    "corpus/Corpus",
    "corpus/Corpuses",
    "corpus/CorpusLinkView",
    "user/User",
    "app/UpdatingCollectionView",
    "libs/OPrime"
], function(
    Backbone, 
    Handlebars, 
    Corpus,
    Corpuses,
    CorpusLinkView,
    User,
    UpdatingCollectionView
) {
  var UserReadView = Backbone.View.extend(
  /** @lends UserReadView.prototype */
  {
    /**
     * @class The layout of a single User. This view is used in the comments
     *        , it is also embedable in the UserEditView.
     *        
     * @property {String} format Must be set when the view is initialized. Valid
     *           values are "link" "modal" "fullscreen" and "public"
     * 
     * @description Starts the UserView.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("USER READ VIEW init: ");
//      this.model.bind('change:gravatar', this.render, this); //moved back to init moved from initialze to here, ther is a point in app loading when userpublic is an object not a backbone object
      this.changeViewsOfInternalModels();

    },
    
    events : {
      "click .edit-user-profile" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        if(this.format == "modal"){
          window.appView.modalEditUserView.render();
        }else if(this.format == "public"){
          if(window.appView.publicEditUserView.model.get("username") == window.app.get("authentication").get("userPrivate").get("username") ){
            window.appView.publicEditUserView.render();
          }
        }else{
          $(this.el).find(".icon-edit").hide();
        }
      },
      "click .view-public-profile" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        $("#user-modal").modal("hide");
        window.app.router.showFullscreenUser(this.model.id);
      }
     },
    /**
     * The underlying model of the UserReadView is a User.
     */
    model : User,
    
    classname : "user",
    
    /**
     * The Handlebars template rendered as the UserReadLinkView.
     */
    linkTemplate : Handlebars.templates.user_read_link,
    
    /**
     * The Handlebars template rendered as the UserReadModalView.
     */
    modalTemplate : Handlebars.templates.user_read_modal,
    
    /**
     * The Handlebars template rendered as the UserReadFullscreenView.
     */
    fullscreenTemplate : Handlebars.templates.user_read_fullscreen,
    
    /**
     * Renders the UserReadView.
     */
    render : function() {
      
//      if (OPrime.debugMode) OPrime.debug("USER render: ");
      if (this.model == undefined) {
        if (OPrime.debugMode) OPrime.debug("\User model was undefined");
        return this;
      }
//      if (OPrime.debugMode) OPrime.debug("\tRendering user: " + this.model.get("username"));

      if (this.format == "fullscreen") {
        if (OPrime.debugMode) OPrime.debug("USER READ FULLSCREEN render: ");

        this.setElement($("#user-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        $(this.el).find(".locale_User_Profile").html(Locale.get("locale_Private_Profile"));

        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      } else if (this.format == "modal") {
        if (OPrime.debugMode) OPrime.debug("USER READ MODAL render: ");

        this.setElement($("#user-modal"));
        $(this.el).html(this.modalTemplate(this.model.toJSON()));
        
        //localization for user edit modal
        $(this.el).find(".locale_Edit_User_Profile_Tooltip").attr("title",Locale.get("locale_Edit_User_Profile_Tooltip"));
        $(this.el).find(".locale_View_Public_Profile_Tooltip").html(Locale.get("locale_View_Public_Profile_Tooltip"));
        $(this.el).find(".locale_Private_Profile_Instructions").html(Locale.get("locale_Private_Profile_Instructions"));
        $(this.el).find(".locale_Close").html(Locale.get("locale_Close"));
        $(this.el).find(".locale_User_Profile").html(Locale.get("locale_Private_Profile"));


        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      } else if (this.format == "link") {
        if (OPrime.debugMode) OPrime.debug("USER READ LINK render: ");

        $(this.el).html(this.linkTemplate(this.model.toJSON()));
        
        //localization for link view
        $(this.el).find(".locale_View_Profile_Tooltip").attr("title",Locale.get("locale_View_Profile_Tooltip"));

      } else if (this.format == "public") {
        if (OPrime.debugMode) OPrime.debug("USER READ PUBLIC render: ");

        this.setElement($("#public-user-page"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        //localize the public user page
        $(this.el).find(".locale_Edit_Public_User_Profile").attr("title",Locale.get("locale_Edit_Public_User_Profile"));
        $(this.el).find(".locale_User_Profile").html(Locale.get("locale_Public_Profile"));

     // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      }else{
        throw("The UserReadView doesn't know what format to display, you need to tell it a format");
      }
      
      if(this.format != "link"){
        //localization for all except link

        $(this.el).find(".locale_Gravatar").html(Locale.get("locale_Gravatar"));
        $(this.el).find(".locale_Email").html(Locale.get("locale_Email"));
        $(this.el).find(".locale_Research_Interests").html(Locale.get("locale_Research_Interests"));
        $(this.el).find(".locale_Affiliation").html(Locale.get("locale_Affiliation"));
        $(this.el).find(".locale_Description").html(Locale.get("locale_Description"));
        $(this.el).find(".locale_Corpora").html(Locale.get("locale_Corpora"));
      }

      return this;
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

  return UserReadView;
});