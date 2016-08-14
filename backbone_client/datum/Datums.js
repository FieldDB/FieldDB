define([
  "libs/FieldDBBackboneCollection",
  "datum/Datum"
], function(
  FieldDBBackboneCollection,
  Datum
) {
  var Datums = FieldDBBackboneCollection.extend( /** @lends Datums.prototype */ {
    /**
     * @class A collection of Datums.
     *
     * @extends Backbone.Collection
     * @constructs
     */
    initialize: function() {
      // this.model = Datum;
    },
    /**
     * backbone-couchdb adaptor set up
     */
    db: {
      view: "datums",
      changes: false,
      filter: Backbone.couch_connector.config.ddoc_name + "/datums"
    },
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url: "/datums", //&decending=true
    // The messages should be ordered by date
    //       comparator : function(doc){
    //         return doc.get("timestamp");
    //       },

    internalModels: Datum,

    model: Datum,

    fetchDatums: function(suces, fail) {
      this.fetch({
        error: function(model, xhr, options) {
          if (OPrime.debugMode) OPrime.debug("There was an error loading your datums.");
          console.log(model, xhr, options);
          OPrime.bug("There was an error loading your data.");
          if (typeof fail == "function") {
            fail();
          }
        },
        success: function(model, response, options) {
          console.log("Datums fetched ", model, response, options);
          if (response.length == 0) {
            OPrime.bug("You have no datums");
          }
          if (typeof suces == "function") {
            suces();
          }
        }
      });
    },

    /**
     * Gets all the DatumIds in the current Corpus sorted by their date.
     *
     * @param {Function} callback A function that expects a single parameter. That
     * parameter is the result of calling "deprecated/datums". So it is an array
     * of objects. Each object has a 'key' and a 'value' attribute. The 'key'
     * attribute contains the Datum's dateModified and the 'value' attribute contains
     * the Datum itself.
     */
    getMostRecentIdsByDate: function(howmany, callback) {
      var self = this;

      if (OPrime.isBackboneCouchDBApp()) {
        //        alert("TODO check  getMostRecentIdsByDate");
        //TODO this might be producing the error on line  815 in backbone.js       model = new this.model(attrs, options);
        this.fetch({
          descending: true,
          limit: howmany,
          error: function(model, xhr, options) {
            OPrime.bug("There was an error loading your data.");
            if (typeof callback == "function") {
              callback([]);
            }
          },
          success: function(model, response, options) {
            //            if (response.length >= 1) {
            //              callback([response[0]._id], [response[1]._id]);
            callback(response);
            //            }
          }
        });
        return;
      }

      try {
        self.pouch(function(err, db) {
          db.query("deprecated/datums", {
            reduce: false
          }, function(err, response) {

            if (err) {
              if (window.toldSearchtomakebydateviews) {
                if (OPrime.debugMode) OPrime.debug("Told pouch to make by date views once, apparently it didnt work. Stopping it from looping.");
                return;
              }
              /*
               * Its possible that the pouch has no by date views, create them and then try searching again.
               */
              window.toldSearchtomakebydateviews = true;
              window.app.get("corpus").createPouchView("deprecated/datums", function() {
                window.appView.toastUser("Initializing your corpus' sort items by date functions for the first time.", "alert-success", "Sort:");
                self.getMostRecentIdsByDate(howmany, callback);
              });
              return;
            }

            if ((!err) && (typeof callback == "function")) {
              if (OPrime.debugMode) OPrime.debug("Callback with: ", response.rows);
              callback(response.rows);
            }
          });
        });

      } catch (e) {
        //        appView.datumsEditView.newDatum();
        appView.datumsEditView.render();
        alert("Couldnt show the most recent datums " + JSON.stringify(e));

      }
    }
  });

  return Datums;
});
