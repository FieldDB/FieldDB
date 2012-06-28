define( [
    "use!backbone", 
    "use!handlebars", 
    "text!permission/permissions_read_embedded.handlebars",
    "text!permission/permissions_edit_embedded.handlebars",
    "permission/Permission",
    "permission/Permissions",
], function(Backbone,
            Handlebars, 
            permissions_read_embeddedTemplate, 
            permissions_edit_embeddedTemplate, 
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

    templateread : Handlebars.compile(permissions_read_embeddedTemplate),
    templateedit : Handlebars.compile(permissions_edit_embeddedTemplate),

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