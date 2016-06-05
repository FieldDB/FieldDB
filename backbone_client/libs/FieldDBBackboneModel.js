"use strict";

define([
  "backbone",
  "jquerycouch",
  "libs/backbone_couchdb/backbone-couchdb"
], function(
  Backbone,
  jquerycouch,
  backbonecouch
) {

  var FieldDBBackboneModel = Backbone.Model.extend( /** @lends FieldDBBackboneModel.prototype */ {
    /**
     * @class The FieldDBBackboneModel handles setup and parsing using an appropriate FieldDB Model because
     * Backbone is unable to use fielddb models straight, in order for them to inherit both functionality they are wrapped.
     *
     * @extends Backbone.Model
     * @constructs
     */
  });

  return FieldDBBackboneModel;
});

