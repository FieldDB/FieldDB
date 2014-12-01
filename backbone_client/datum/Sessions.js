/* globals OPrime, window, define */
define([
  "backbone",
  "datum/Session"
], function(
  Backbone,
  Session
) {
  var Sessions = Backbone.Collection.extend(
    /** @lends Sessions.prototype */
    {
      /**
       * @class A collection of Sessions Probably will be used in the fullscreen corpus view.
       *
       * @extends Backbone.Collection
       * @constructs
       */
      initialize: function() {},

      /**
       * backbone-couchdb adaptor set up
       */
      db: {
        view: "sessions",
        changes: false,
        filter: Backbone.couch_connector.config.ddoc_name + "/sessions"
      },
      // The couchdb-connector is capable of mapping the url scheme
      // proposed by the authors of Backbone to documents in your database,
      // so that you don't have to change existing apps when you switch the sync-strategy
      url: "/sessions",
      // The messages should be ordered by date
      comparator: function(doc) {
        return doc.get("timestamp");
      },

      internalModels: Session,

      model: Session,

      fetchSessions: function(suces, fail) {
        try {
          this.fetch({
            error: function(model, xhr, options) {
              if (OPrime.debugMode) {OPrime.debug("There was an error loading your sessions.");}
              OPrime.debug(model, xhr, options);
              OPrime.bug("There was an error loading your sessions.");
              if (typeof fail === "function") {
                fail();
              }
            },
            success: function(model, response, options) {
              OPrime.debug("Sessions fetched ", model, response, options);
              if (response.length === 0) {
                OPrime.debug("You have no sessions, TODO creating a new one...");
                if (window.location.href.indexOf("corpus.html") > -1) {
                  window.location.replace("user.html");
                }
              }
              if (typeof suces === "function") {
                suces();
              }
            }
          });

        } catch (e) {
          console.warn("problem doing a set on the sessions... ", e);
        }

      }
    });

  return Sessions;
});
