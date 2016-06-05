define([
  "libs/FieldDBBackboneCollection",
  "permission/Permission"
], function(
  FieldDBBackboneCollection,
  Permission
) {
  var Permissions = FieldDBBackboneCollection.extend( /** @lends Permissions.prototype */ {
    /**
     * @class A collection of Permissions
     *
     * @extends Backbone.Collection
     * @constructs
     */
    initialize: function() {},
    internalModels: Permission,
    model: Permission
  });

  return Permissions;
});
