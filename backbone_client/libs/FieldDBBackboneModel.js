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

  var FieldDBBackboneModel = Backbone.Model.extend( /** @lends FieldDBBackboneModel.prototype */ {
    /**
     * @class The FieldDBBackboneModel handles setup and parsing using an appropriate FieldDB Model because
     * Backbone is unable to use fielddb models straight, in order for them to inherit both functionality they are wrapped.
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize: function() {
      if (OPrime.debugMode) {
        OPrime.debug("INIT");
      }

      for (var event in this.globalEvents) {
        if (!this.globalEvents.hasOwnProperty(event)) {
          continue;
        }

        this.listenTo(Backbone, event, this.globalEvents[event]);
      }

      if (this.get("filledWithDefaults")) {
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },

    /**
     * Deprecated method which was used to change between pouchdbs
     * @param  {String}   dbname   the databsename
     * @param  {Function} callback Function to call after the database has been changed
     * @return {String}            [description]
     */
    changePouch: function(dbname, callback) {
      if (OPrime.isBackboneCouchDBApp()) {
        if (typeof callback == "function") {
          callback();
        }
        return;
      }

      if (this.pouch == undefined) {
        this.pouch = Backbone.sync.pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + dbname : OPrime.pouchUrl + dbname);
      }
      if (typeof callback == "function") {
        callback();
      }
    },

    /**
     * Used to deeply parse models
     * @type {Object}
     */
    internalModels: {},

    /**
     * Deprecated save function
     *
     * @param  {Function} callback Function to call after the save has happened
     */
    saveAndInterConnectInApp: function(callback) {
      if (typeof callback == "function") {
        callback();
      }
    }
  });

  return FieldDBBackboneModel;
});
