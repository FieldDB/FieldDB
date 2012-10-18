define([ 
    "backbone", 
    "handlebars", 
    "corpus/Corpus",
    "corpus/Corpuses",
    "corpus/CorpusLinkView",
    "user/User",
    "app/UpdatingCollectionView",
    "libs/Utils"
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
     * @class The layout of a single User. This view is used in the activity
     *        feeds, it is also embedable in the UserEditView.
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
      Utils.debug("USER READ VIEW init: ");
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
          window.appView.publicEditUserView.render();
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
      
//      Utils.debug("USER render: ");
      if (this.model == undefined) {
        Utils.debug("\User model was undefined");
        return this;
      }
//      Utils.debug("\tRendering user: " + this.model.get("username"));

      if (this.format == "fullscreen") {
        Utils.debug("USER READ FULLSCREEN render: ");

        this.setElement($("#user-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        $(this.el).find(".locale_User_Profile").html(Locale["locale_Private_Profile"].message);

        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      } else if (this.format == "modal") {
        Utils.debug("USER READ MODAL render: ");

        this.setElement($("#user-modal"));
        $(this.el).html(this.modalTemplate(this.model.toJSON()));
        
        //localization for user edit modal
        $(this.el).find(".locale_Edit_User_Profile_Tooltip").attr("title",Locale["locale_Edit_User_Profile_Tooltip"].message);
        $(this.el).find(".locale_View_Public_Profile_Tooltip").html(Locale["locale_View_Public_Profile_Tooltip"].message);
        $(this.el).find(".locale_Private_Profile_Instructions").html(Locale["locale_Private_Profile_Instructions"].message);
        $(this.el).find(".locale_Close").html(Locale["locale_Close"].message);
        $(this.el).find(".locale_User_Profile").html(Locale["locale_Private_Profile"].message);


        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      } else if (this.format == "link") {
        Utils.debug("USER READ LINK render: ");

        $(this.el).html(this.linkTemplate(this.model.toJSON()));
        
        //localization for link view
        $(this.el).find(".locale_View_Profile_Tooltip").attr("title",Locale["locale_View_Profile_Tooltip"].message);

      } else if (this.format == "public") {
        Utils.debug("USER READ PUBLIC render: ");

        this.setElement($("#public-user-page"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        //localize the public user page
        $(this.el).find(".locale_Edit_Public_User_Profile").attr("title",Locale["locale_Edit_Public_User_Profile"].message);
        $(this.el).find(".locale_User_Profile").html(Locale["locale_Public_Profile"].message);

     // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      }else{
        throw("The UserReadView doesn't know what format to display, you need to tell it a format");
      }
      
      if(this.format != "link"){
        //localization for all except link

        $(this.el).find(".locale_Gravatar").html(Locale["locale_Gravatar"].message);
        $(this.el).find(".locale_Email").html(Locale["locale_Email"].message);
        $(this.el).find(".locale_Research_Interests").html(Locale["locale_Research_Interests"].message);
        $(this.el).find(".locale_Affiliation").html(Locale["locale_Affiliation"].message);
        $(this.el).find(".locale_Description").html(Locale["locale_Description"].message);
        $(this.el).find(".locale_Corpora").html(Locale["locale_Corpora"].message);
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