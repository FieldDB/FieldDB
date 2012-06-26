define([
    "use!backbone", 
    "use!handlebars", 
    "text!datum/session.handlebars",
    "datum/DatumFieldValueEditView",
    "datum/Session",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    sessionTemplate,
    DatumFieldValueEditView,
    Session,
    UpdatingCollectionView
) {
  var SessionView = Backbone.View.extend(
  /** @lends SessionView.prototype */
  {
    /**
     * @class Session View This is the summary of the session that user can see
     *        from the corpusGlimpseView
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
     * The underlying model of the SessionView is a Session.
     */
    model : Session,
    /**
     * The sessionFieldsView displays the all the DatumFieldValueEditViews.
     */
    sessionFieldsView : UpdatingCollectionView,
    /**
     * The Handlebars template rendered as the SessionView.
     */
    template: Handlebars.compile(sessionTemplate),
    
    /**
     * Renders the SessionView.
     */
    render : function() {
      Utils.debug("SESSION render: " + this.el);
      
      // Display the SessionView
      this.setElement("#session");
      $(this.el).html(this.template(this.model.toJSON()));
      
      this.sessionFieldsView.el = this.$(".session_fields_ul");
      this.sessionFieldsView.render();
      
      return this;
    },
    
    /**
     * Initialize the sample Session. TODO this needs to be done using the new Session model which has an array of datumfields in it.
     * 
     * @param {Corpus} corpus The corpus associated with this Session.
     */
 //   loadSample : function(corpus) {
//      this.model.set({
//        user : "sapir",
//        consultant : "Tillohash",
//        corpus : corpus,
//        language : "Cusco Quechua",
//        goal : "Which verbs can be affixed with -naya"
//      });
 //   }
  });
  
  return SessionView;
}); 