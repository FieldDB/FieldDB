define([
    "use!backbone", 
    "use!handlebars", 
    "text!datum/session_read_embedded.handlebars",
    "datum/DatumFieldValueEditView",
    "datum/Session",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone,
    Handlebars, 
    sessionEditTemplate,
    DatumFieldValueEditView,
    Session,
    UpdatingCollectionView
) {
  var SessionReadView = Backbone.View.extend(
  /** @lends SessionView.prototype */
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
        childViewConstructor : DatumFieldValueEditView,
        childViewTagName     : "li",
      });
      
      this.model.bind('change', this.render, this);
    },

    /**
     * The underlying model of the SessionReadView is a Session.
     */
    model : Session,
    
    /**
     * The sessionFieldsView displays the all the DatumFieldValueEditViews.
     */
    sessionFieldsView : UpdatingCollectionView,

    /**
     * Events that the SessionReadView is listening to and their handlers.
     */
    events : {
    
      "click #btn-save-session" : "updatePouch"
    },
    
    /**
     * The Handlebars template rendered as the SessionReadView.
     */
    template: Handlebars.compile(sessionEditTemplate),
    
    /**
     * Renders the SessionView.
     */
    render : function() {
      Utils.debug("SESSION render: " + this.el);
      
      // Display the SessionView
      this.setElement("#new-session-view");
      $(this.el).html(this.template(this.model.toJSON()));
      
      this.sessionFieldsView.el = this.$(".session-fields-ul");
      this.sessionFieldsView.render();
      
      return this;
    },
    
    /**
     * Initialize the sample Session.
     * 
     * @param {Corpus} corpus The corpus associated with this Session.
     */
//    loadSample : function(corpus) {
//      this.model.set({
//        user : "sapir",
//        consultant : "Tillohash",
//        corpus : corpus,
//        language : "Cusco Quechua",
//        goal : "Working on naya"
//      });
//    },
    
    
    updatePouch : function() {
      Utils.debug("Saving the Session");
      this.model.save();
    }
  });
  
  return SessionReadView;
}); 