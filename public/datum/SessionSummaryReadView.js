define([
    "use!backbone",
    "use!handlebars",
    "text!datum/session_summary_read_embedded.handlebars",
    "datum/Session",
    "libs/Utils"
], function(
    Backbone,
    Handlebars,
    sessionTemplate,
    Session
) {
  var SessionSummaryReadView = Backbone.View.extend(
  /** @lends SessionSummaryReadView.prototype */
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
     * The underlying model of the SessionSummaryReadView is a Session.
     */
    model : Session,
    
    /**
     * The Handlebars template rendered as the SessionSummaryReadView.
     */
    template: Handlebars.compile(sessionTemplate),
    
    /**
     * Renders the SessionSummaryReadView.
     */
    render : function() {
      Utils.debug("SESSION render: " + this.el);
      
      // Disply the SessionSummaryReadView
      this.setElement("#session");
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    },
    
    /**
     * Initialize the sample Session. TODO this needs to be done using the new Session model which has an array of datumfields in it.
     *
     * @param {Corpus} corpus The corpus associated with this Session.
     */
    loadSample : function(corpus) {
      // this.model.set({
      // user : "sapir",
      // consultant : "Tillohash",
      // corpus : corpus,
      // language : "Cusco Quechua",
      // goal : "Which verbs can be affixed with -naya"
      // });
    }
  });
  
  return SessionSummaryReadView;
}); 