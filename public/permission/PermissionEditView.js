define([ 
         "backbone",
         "handlebars", 
         "permission/Permission"
  ], function(
      Backbone, 
      Handlebars,
      Permission
) {
  var PermissionEditView = Backbone.View.extend(
  /** @lends PermissionEditView.prototype */
  {
    /**
     * @class This is the view of the Permission Model. The Permission is a
     *        textarea that includes a username and a timestamp.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("PERMISSION init");
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
    template : Handlebars.templates.permissions_edit_embedded,
    
    /**
     * Renders the DatumFieldView.
     */
    render : function() {
      Utils.debug("PERMISSION render");
//      var JSONtorender = {};
//      if ( typeof this.model != undefined){
//        JSONtorender.timestamp = this.model.timestamp.toString();
//        JSONtorender.username = this.model.username;
//      }
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updatePermission : function() {
      //TODO
    }
  });

  return PermissionEditView;
});