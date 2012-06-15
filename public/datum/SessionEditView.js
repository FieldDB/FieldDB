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
    }
  });
  
  return SessionEditView;
}); 