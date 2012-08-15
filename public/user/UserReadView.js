define([ 
    "backbone", 
    "handlebars", 
    "corpus/Corpus",
    "corpus/Corpuses",
    "user/User",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    Corpus,
    Corpuses,
    User
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
      Utils.debug("USER READ VIEW init: " + this.el);
//      this.model.bind('change:gravatar', this.render, this); //moved back to init moved from initialze to here, ther is a point in app loading when userpublic is an object not a backbone object

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
      
//      Utils.debug("USER render: " + this.el);
      if (this.model == undefined) {
        Utils.debug("\User model was undefined");
        return this;
      }
//      Utils.debug("\tRendering user: " + this.model.get("username"));

      if (this.format == "fullscreen") {
        Utils.debug("USER READ FULLSCREEN render: " + this.el);

        this.setElement($("#user-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
      } else if (this.format == "modal") {
        Utils.debug("USER READ MODAL render: " + this.el);

        this.setElement($("#user-modal"));
        $(this.el).html(this.modalTemplate(this.model.toJSON()));
        
        //localization for user edit modal
        $(this.el).find(".locale_Edit_User_Profile_Tooltip").attr("title",chrome.i18n.getMessage("locale_Edit_User_Profile_Tooltip"));
        $(this.el).find(".locale_View_Public_Profile_Tooltip").html(chrome.i18n.getMessage("locale_View_Public_Profile_Tooltip"));
        $(this.el).find(".locale_Private_Profile_Instructions").html(chrome.i18n.getMessage("locale_Private_Profile_Instructions"));
        $(this.el).find(".locale_Close").html(chrome.i18n.getMessage("locale_Close"));

      } else if (this.format == "link") {
        Utils.debug("USER READ LINK render: " + this.el);

        $(this.el).html(this.linkTemplate(this.model.toJSON()));
        
        //localization for link view
        $(this.el).find(".locale_View_Profile_Tooltip").attr("title",chrome.i18n.getMessage("locale_View_Profile_Tooltip"));

      } else if (this.format == "public") {
        Utils.debug("USER READ PUBLIC render: " + this.el);

        this.setElement($("#public-user-page"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        //localize the public user page
        $(this.el).find(".locale_Edit_Public_User_Profile").attr("title",chrome.i18n.getMessage("locale_Edit_Public_User_Profile"));

      }else{
        throw("The UserReadView doesn't know what format to display, you need to tell it a format");
      }
      
      if(this.format != "link"){
        //localization for all except link
        $(this.el).find(".locale_User_Profile").html(chrome.i18n.getMessage("locale_User_Profile"));
        $(this.el).find(".locale_Gravatar").html(chrome.i18n.getMessage("locale_Gravatar"));
        $(this.el).find(".locale_Email").html(chrome.i18n.getMessage("locale_Email"));
        $(this.el).find(".locale_Research_Interests").html(chrome.i18n.getMessage("locale_Research_Interests"));
        $(this.el).find(".locale_Affiliation").html(chrome.i18n.getMessage("locale_Affiliation"));
        $(this.el).find(".locale_Description").html(chrome.i18n.getMessage("locale_Description"));
        $(this.el).find(".locale_Corpora").html(chrome.i18n.getMessage("locale_Corpora"));
      }

      return this;
    },
    
    
    
    /**
     * Initializes the public User.
     */
    
    loadPublic : function(){
      var oldprefs = this.model.get("prefs");
//      this.model = new User({
//        "username" : "public",
//        "password" : "",
//        "email" : "",
//        "firstname" : "Anonymous",
//        "lastname" : "User",
//        "gravatar" : "./../user/public_gravatar.png",
//        "researchInterest" : "",
//        "affiliation" : "",
//        "description" : "",
//        "subtitle" : "",
//        "corpuses" : ["5028B933-72BB-4EA4-ADF8-67C2A5ABC968"],
//        "dataLists" : [],
//        "prefs" : oldprefs,
//        "teams" : []
//      });

//      this.model.id = "E144FA24-BAF4-48F9-9800-62E7A7E93CF4";
//      this.model.fetch();
      this.model.set ({
          "id": "E144FA24-BAF4-48F9-9800-62E7A7E93CF4",
          "username" : "ifieldpublicuser",
          "password" : "",
          "email" : "",
          "firstname" : "Anonymous",
          "lastname" : "User",
          "gravatar" : "./../user/public_gravatar.png",
          "prefs" : oldprefs,
        });
//      var n = new Corpus({title: "test corpus filled in userView", titleAsUrl: "test"});
//      this.model.get("corpuses").push(n.id);
//      var d = new DataList({});
//      this.model.get("dataLists").push(d.id); 
//      var self = this;
//      this.model.save(
//          null,
//          {
//            success : function() {
//              self.model.get("corpuses").push(n.id);
//            },
//            error : function() {
//              alert("Unable to create new corpus.");
//            }
//          }
//      );
    }
  });

  return UserReadView;
});