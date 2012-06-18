define( [
    "use!backbone", 
    "use!handlebars", 
    "text!permission/permissions.handlebars",
    "permission/Permission",
    "permission/Permissions",
], function(Backbone,
            Handlebars, 
            permissionsTemplate, 
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

    template : Handlebars.compile(permissionsTemplate),

    render : function() {
      
      this._rendered = true;
      Utils.debug("Permissions render: ");
      
      this.setElement(".permissions_settings");
      var jsonToRender = {title: "Permission Settings"};
      $(this.el).html(this.template(jsonToRender));    
      return this;
   
    }
  });

  return Permissions;
});