define([
    "backbone", 
    "handlebars", 
    "datum/DatumFieldEditView",
    "datum/Session",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone,
    Handlebars, 
    DatumFieldEditView,
    Session,
    UpdatingCollectionView
) {
  var SessionEditView = Backbone.View.extend(
  /** @lends SessionEditView.prototype */
  {
    /**
     * @class Session Edit View is where the user provides new session details.
     *
     ** @property {String} format Must be set when the view is
     * initialized. Valid values are "leftSide" and
     * "embedded" 
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("SESSION init: " + this.el);

      this.sessionFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("sessionFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : "li",
        format               : "datum"
      });
      
      this.model.bind('change', this.showEditable, this);
    },

    /**
     * The underlying model of the SessionEditView is a Session.
     */
    model : Session,
    
    /**
     * The sessionFieldsView displays the all the DatumFieldEditViews.
     */
    sessionFieldsView : UpdatingCollectionView,

    /**
     * Events that the SessionEditView is listening to and their handlers.
     */
    events : {
    
      "click #btn-save-session" : "updatePouch",
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeLarge",
      "click .icon-book": "showReadonly",
      "blur .session-consultant-input" : "updateConsultant",
      "blur .session-elicitation-date-input" : "updateElicitedDate",
      "blur .session-goal-input" : "updateGoal"
    },
    updateConsultant : function(){
      this.model.get("sessionFields").where({
        label : "consultants"
      })[0].set("value", this.$el.find(".session-consultant-input")
          .val());
    },
    updateElicitedDate : function(){
      this.model.get("sessionFields").where({
        label : "dateElicited"
      })[0].set("value", this.$el.find(".session-elicitation-date-input")
          .val());
    },
    updateGoal : function(){
      this.model.get("sessionFields").where({
        label : "goal"
      })[0].set("value", this.$el.find(".session-goal-input")
          .val());
    },
    /**
     * The Handlebars template rendered as the Embedded.
     */
    templateEmbedded: Handlebars.templates.session_edit_embedded,
    
    /**
     * The Handlebars template rendered as the Summary.
     */
    templateSummary : Handlebars.templates.session_summary_edit_embedded,
    
    /**
     * Renders the SessionEditView.
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
            dateElicited : this.model.get("sessionFields").where({label: "dateElicited"})[0].get("value")//NOTE: changed this to the date elicited, they shouldnt edit the date entered.
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
      var self = this;
      this.model.changeCorpus(this.model.get("corpusname"),function(){
        self.model.save();
      });
    },
    
    //functions associated with icons
    resizeSmall : function(){
      window.app.router.showDashboard();
    },
    resizeLarge : function(){
      window.app.router.showEmbeddedSession();
    },
    //bound to changes
    showEditable :function(){
      window.appView.renderEditableSessionViews();
    },
    //bound to book
    showReadonly : function(){
      window.app.router.showReadonlySession();
    }
  });
  
  return SessionEditView;
}); 