define([
    "use!backbone", 
    "use!handlebars", 
    "datum/Session",
    "text!datum/session_edit.handlebars",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    Session, 
    session_editTemplate
) {
  var SessionEditView = Backbone.View.extend(
  /** @lends SessionView.prototype */
  {
    /**
     * @class Session View
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("SESSION init: " + this.el);
      
      this.model.bind('change', this.render, this);
    },

    /**
     * The underlying model of the SessionEditView is a Session.
     */
    model : Session,
    
    /**
     * Events that the SessionEditView is listening to and their handlers.
     */
    events : {
      "blur .session_informant" : "updateInformant",
      "blur .session_language" : "updateLanguage",
      "blur .session_family" : "updateFamily",
      "blur .session_dialect" : "updateDialect",
      "blur .session_goal" : "updateGoal",
      "blur .session_date" : "updateDate",
      "click #btn-save-session" : "updatePouch"
    },
    
    /**
     * The Handlebars template rendered as the SessionEditView.
     */
    template: Handlebars.compile(session_editTemplate),
    
    /**
     * Renders the SessionView.
     */
    render : function() {
      Utils.debug("SESSION render: " + this.el);
      
      // Disply the SessionView
      this.setElement("#new-session-view");
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    },
    
    /**
     * Initialize the sample Session.
     * 
     * @param {Corpus} corpus The corpus associated with this Session.
     */
    loadSample : function(corpus) {
      this.model.set({
        user : "sapir",
        informant : "Tillohash",
        corpus : corpus,
        language : "Cusco Quechua",
        goal : "Working on naya"
      });
    },
    
    updateInformant : function() {
      this.model.set("informant", $(".session_informant").val());
    },
    
    updateLanguage : function() {
      this.model.set("language", $(".session_language").val());
    },
    
    updateFamily : function() {
      this.model.set("languageFamily", $(".session_family").val());
    },
    
    updateDialect : function() {
      this.model.set("dialect", $(".session_dialect").val());
    },
    
    updateGoal : function() {
      this.model.set("goal", $(".session_goal").val());
    },
    
    updateDate : function() {
      this.model.set("date", $(".session_date").val());
    },
    
    updatePouch : function() {
      Utils.debug("Saving the Session");
      this.model.save();
    }
  });
  
  return SessionEditView;
}); 