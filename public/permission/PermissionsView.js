define( [
    "backbone", 
    "handlebars", 
    "permission/Permission",
    "permission/Permissions",
], function(Backbone,
            Handlebars, 
            Permission,
            Permissions) {
    var Permissions = Backbone.View.extend(
  /** @lends PermissionsView.prototype */
  {
    /**
     * @class Permissions
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
    },

    model : Permission,

    classname : "permissions",

    templateread : Handlebars.templates.permissions_read_embedded,
    templateedit : Handlebars.templates.permissions_edit_embedded,

    render : function() {
      
      this._rendered = true;
      Utils.debug("Permissions render: ");
      
      this.setElement(".permissions_settings");
      var jsonToRender = {title: "Permission Settings"};
      $(this.el).html(this.templateedit(jsonToRender));    
      return this;
   
    }
  });

  return Permissions;
});