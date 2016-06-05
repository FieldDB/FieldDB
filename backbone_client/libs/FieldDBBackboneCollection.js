define([
  "backbone",
  "jquerycouch",
  "libs/backbone_couchdb/backbone-couchdb",
  "OPrime"
], function(
  Backbone,
  jquerycouch,
  backbonecouch,
  OPrime
) {
  "use strict";

  var FieldDBBackboneCollection = Backbone.Collection.extend( /** @lends FieldDBBackboneCollection.prototype */ {
    /**
     * @class The FieldDBBackboneCollection handles setup and parsing using an appropriate FieldDB Collection because
     * Backbone is unable to use fielddb models straight, in order for them to inherit both functionality they are wrapped.
     *
     * @extends Backbone.Collection
     * @constructs
     */
  });

  return FieldDBBackboneCollection;
});
