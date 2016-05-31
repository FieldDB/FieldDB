"use strict";

define([
  "backbone"
], function(
  Backbone
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

