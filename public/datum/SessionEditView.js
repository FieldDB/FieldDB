define([
    "use!backbone", 
    "use!handlebars", 
    "text!datum/session_edit_embedded.handlebars",
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
  var SessionEditView = Backbone.View.extend(
  /** @lends SessionEditView.prototype */
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
     * The underlying model of the SessionEditView is a Session.
     */
    model : Session,
    
    /**
     * The sessionFieldsView displays the all the DatumFieldValueEditViews.
     */
    sessionFieldsView : UpdatingCollectionView,

    /**
     * Events that the SessionEditView is listening to and their handlers.
     */
    events : {
    
      "click #btn-save-session" : "updatePouch"
    },
    
    /**
     * The Handlebars template rendered as the SessionEditView.
     */
    template: Handlebars.compile(sessionEditTemplate),
    
    /**
     * Renders the SessionEditView.
     */
    render : function() {
      Utils.debug("SESSION render: " + this.el);
      
      // Display the SessionEditView
      this.setElement("#session-embedded");
      $(this.el).html(this.template(this.model.toJSON()));
      
      this.sessionFieldsView.el = this.$(".session-fields-ul");
      this.sessionFieldsView.render();
      
      return this;
    },    
    
    updatePouch : function() {
      Utils.debug("Saving the Session");
      this.model.save();
    }
  });
  
  return SessionEditView;
}); 