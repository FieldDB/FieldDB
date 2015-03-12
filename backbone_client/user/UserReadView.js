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
        $("#user-modal").hide();
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

      if (this.model == undefined) {
        if (OPrime.debugMode) OPrime.debug("\User model was undefined");
        return this;
      }
      var jsonToRender = this.model.toJSON();

      jsonToRender.locale_User_Profile = Locale.get("locale_Private_Profile");
      jsonToRender.locale_Edit_User_Profile_Tooltip = Locale.get("locale_Edit_User_Profile_Tooltip");
      jsonToRender.locale_View_Public_Profile_Tooltip = Locale.get("locale_View_Public_Profile_Tooltip");
      jsonToRender.locale_Private_Profile_Instructions = Locale.get("locale_Private_Profile_Instructions");
      jsonToRender.locale_Close = Locale.get("locale_Close");
      jsonToRender.locale_User_Profile = Locale.get("locale_Private_Profile");
      jsonToRender.locale_View_Profile_Tooltip = Locale.get("locale_View_Profile_Tooltip");
      jsonToRender.locale_Edit_Public_User_Profile = Locale.get("locale_Edit_Public_User_Profile");
      jsonToRender.locale_User_Profile = Locale.get("locale_Public_Profile");
      jsonToRender.locale_Gravatar = Locale.get("locale_Gravatar");
      jsonToRender.locale_Email = Locale.get("locale_Email");
      jsonToRender.locale_Research_Interests = Locale.get("locale_Research_Interests");
      jsonToRender.locale_Affiliation = Locale.get("locale_Affiliation");
      jsonToRender.locale_Description = Locale.get("locale_Description");
      jsonToRender.locale_Corpora = Locale.get("locale_Corpora");

      if (this.format == "fullscreen") {
        this.setElement($("#user-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(jsonToRender));
      } else if (this.format == "modal") {
        this.setElement($("#user-modal"));
        $(this.el).html(this.modalTemplate(jsonToRender));
      } else if (this.format == "link") {
        $(this.el).html(this.linkTemplate(jsonToRender));
      } else if (this.format == "public") {
        this.setElement($("#public-user-page"));
        $(this.el).html(this.fullscreenTemplate(jsonToRender));
      }else{
        throw("The UserReadView doesn't know what format to display, you need to tell it a format");
      }

      if (this.format !== "link") {
        try {
          $(this.el).find(".description").html($.wikiText(jsonToRender.description));
          $(this.el).find(".researchInterest").html($.wikiText(jsonToRender.researchInterest));
        } catch (e) {
          OPrime.debug("Wiki markup formatting didnt work.");
        }

        // Display the CorpusesReadView
        this.corporaReadView.el = $(this.el).find('.corpora');
        this.corporaReadView.render();

        var couchConnection = window.app.get("couchConnection");
        var self = this;
        FieldDB.CORS.makeCORSRequest({
          type: 'GET',
          url: OPrime.getCouchUrl(couchConnection, "/_session")
        }).then(function(serverResults) {
          if (self.model && self.model.updateListOfCorpora) {
            self.model.updateListOfCorpora(serverResults.userCtx.roles);
            self.changeViewsOfInternalModels();
          }
        });
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

  return UserReadView;
});
