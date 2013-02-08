define([ 
         "backbone",
         "handlebars", 
         "permission/Permission"
  ], function(
      Backbone, 
      Handlebars,
      Permission
) {
  var PermissionReadView = Backbone.View.extend(
  /** @lends PermissionEditView.prototype */
  {
    /**
     * @class This is the view of the Permission Model. The Permission combination of a couchdb user, and their corpusspecific role
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("PERMISSION READ VIEW init");
    },
    
    /**
     * The underlying model of the PermissionEditView is a Permission.
     */
    model : Permission,
    
    /**
     * Events that the PermissionEditView is listening to and their handlers.
     */
    events : {
    },

    /**
     * The Handlebars template rendered as the PermissionEditView.
     */
    template : Handlebars.templates.permissions_read_embedded,
    
    /**
     * Renders the DatumFieldView.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("PERMISSION READ VIEW render");
      var jsonToRender = this.model.toJSON();
      jsonToRender.users = this.model.get("users").toJSON();
      $(this.el).html(this.template(jsonToRender));
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updatePermission : function() {
      //TODO
    }
  });

  return PermissionReadView;
});