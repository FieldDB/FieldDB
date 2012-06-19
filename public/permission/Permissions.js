define([
    "use!backbone",
    "permission/Permission"
], function(
    Backbone, 
    Permission
) {
    var Permissions = Backbone.Collection.extend(
    /** @lends Permissions.prototype */
    {
       /**
        * @class A collection of Permissions 
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
       },
       
       model: Permission
    });
    
    return Permissions;
});