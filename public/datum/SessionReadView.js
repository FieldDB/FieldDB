define([
    "use!backbone", 
    "use!handlebars", 
    "text!datum/session_read_embedded.handlebars",
    "text!datum/session_summary_read_embedded.handlebars",
    "datum/DatumFieldEditView",
    "datum/Session",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone,
    Handlebars, 
    sessionEmbeddedTemplate,
    sessionSummaryTemplate,
    DatumFieldEditView,
    Session,
    UpdatingCollectionView
) {
  var SessionReadView = Backbone.View.extend(
  /** @lends SessionReadView.prototype */
  {
    /**
     * @class Session Edit View is where the user provides new session details.
    
     * @property {String} format Must be set when the view is
     * initialized. Valid values are "leftSide" and
     * "embedded" 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("SESSION init: " + this.el);

      this.sessionFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("sessionFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : "li",
        childViewFormat      : "datum"
      });
      
      this.model.bind('change', this.render, this);
    },

    /**
     * The underlying model of the SessionReadView is a Session.
     */
    model : Session,
    
    /**
     * The sessionFieldsView displays the all the DatumFieldEditViews.
     */
    sessionFieldsView : UpdatingCollectionView,

    /**
     * Events that the SessionReadView is listening to and their handlers.
     */
    events : {
    
      "click #btn-save-session" : "updatePouch",
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeLarge",
      "click .icon-edit": "showEditable"
  
      
    },
    
    /**
     * The Handlebars template rendered as the Embedded.
     */
    templateEmbedded: Handlebars.compile(sessionEmbeddedTemplate),
    
    /**
     * The Handlebars template rendered as the Summary.
     */
    templateSummary : Handlebars.compile(sessionSummaryTemplate),
    
    /**
     * Renders the SessionReadView.
     */
    render : function() {
      Utils.debug("SESSION render: " + this.el);
      if(this.model == undefined){
        Utils.debug("SESSION is undefined, come back later.");
        return this;
      }
      
      try{
        if(this.model.get("sessionFields").where({label: "goal"})[0] == undefined){
          Utils.debug("SESSION fields are undefined, come back later.");
          return this;
        }
        if (this.format == "embedded") {
          this.setElement("#session-embedded");
          $(this.el).html(this.templateEmbedded(this.model.toJSON()));
          
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
        } else if (this.format == "leftSide") {
          var jsonToRender = {
            goal : this.model.get("sessionFields").where({label: "goal"})[0].get("value"),
            consultants : this.model.get("sessionFields").where({label: "consultants"})[0].get("value"),
            date : this.model.get("sessionFields").where({label: "dateSEntered"})[0].get("value")
          };
          
          this.setElement("#session-quickview");
          $(this.el).html(this.templateSummary(jsonToRender));
        }
      }catch(e){
        Utils.debug("There was a problem rendering the session, probably the datumfields are still arrays and havent been restructured yet.");
      }
      return this;
    },
    
    updatePouch : function() {
      Utils.debug("Saving the Session");
      this.model.save();
    },
    
    //functions associated with corner icons
    resizeSmall : function(){
      window.app.router.showDashboard();
    },
    resizeLarge : function(){
      window.app.router.showEmbeddedSession();
    },
    showEditable :function(){
      window.app.router.showEditableSession();
    },
  });
  
  return SessionReadView;
}); 