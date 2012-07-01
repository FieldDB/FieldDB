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
    sessionReadTemplate,
    sessionSummaryReadTemplate,
    DatumFieldEditView,
    Session,
    UpdatingCollectionView
) {
  var SessionReadView = Backbone.View.extend(
  /** @lends SessionReadView.prototype */
  {
    /**
     * @class Session Edit View is where the user provides new session details.
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
      "click .icon-resize-full" : "resizeLarge"
      
    },
    
    /**
     * The Handlebars template rendered as the SessionReadView.
     */
    template: Handlebars.compile(sessionReadTemplate),
    
    /**
     * The Handlebars template rendered as the SessionSummaryReadView.
     */
    templateSummary : Handlebars.compile(sessionSummaryReadTemplate),
    
    /**
     * Renders the SessionReadView.
     */
    render : function() {
      Utils.debug("SESSION render: " + this.el);
      if(this.model == undefined){
        Utils.debug("SESSION is undefined, come back later.");
        return this;
      }
      if(this.model.get("sessionFields").where({label: "goal"})[0] == undefined){
        Utils.debug("SESSION fields are undefined, come back later.");
        return this;
      }
      
      
      if (this.format == "centerWell") {
        // Display the SessionReadView
        this.setElement("#session-embedded");
        $(this.el).html(this.template(this.model.toJSON()));
        
        this.sessionFieldsView.el = this.$(".session-fields-ul");
        this.sessionFieldsView.render();
      } else if (this.format == "leftSide") {
        var jsonToRender = {
          goal : this.model.get("sessionFields").where({label: "goal"})[0].get("value"),
          consultants : this.model.get("sessionFields").where({label: "consultants"})[0].get("value"),
          date : this.model.get("sessionFields").where({label: "dateSEntered"})[0].get("value")
        };
        
        // Disply the SessionSummaryReadView
        this.setElement("#session-quickview");
        $(this.el).html(this.templateSummary(jsonToRender));
      }
      
      return this;
    },
    
    updatePouch : function() {
      Utils.debug("Saving the Session");
      this.model.save();
    },
    resizeSmall : function(){
      window.app.router.showDashboard();
    },
    resizeLarge : function(){
      window.app.router.showEmbeddedSession();
    }
  });
  
  return SessionReadView;
}); 