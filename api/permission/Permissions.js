define([
    "backbone",
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
       internalModels: Permission,
       model: Permission
    });
    
    return Permissions;
});