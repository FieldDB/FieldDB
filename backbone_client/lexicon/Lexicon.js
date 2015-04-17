define([
  "backbone",
  "lexicon/LexiconNode",
  "lexicon/LexiconNodes"
], function(
  Backbone,
  LexiconNode,
  LexiconNodes
) {
  var Lexicon = Backbone.Model.extend(
    /** @lends Lexicon.prototype */
    {
      /**
       * @class Lexicon is directed graph (triple store) between morphemes and
       *        their allomorphs and glosses. It allows the search to index
       *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
       *
       * @description
       *
       * @extends Backbone.Model
       *
       * @constructs
       *
       */
      initialize: function() {},

      // Internal models: used by the parse function
      internalModels: {
        lexiconNodes: LexiconNodes
      },
      /**
       * Overwrite/build the lexicon from the corpus server if it is there, saves
       * the results to local storage so they can be reused offline.
       *
       * @param dbname
       * @param callback
       */
      buildLexiconFromCouch: function(dbname, callback) {
        var self = this;
        var couchConnection = app.get("corpus").get("couchConnection");
        var couchurl = OPrime.getCouchUrl(couchConnection);
        if (localStorage.getItem(dbname + "lexiconResults")) {
          if (typeof callback == "function") {
            callback();
          }
          return;
        }
        FieldDB.CORS.makeCORSRequest({
          type: 'GET',
          url: couchurl + "/_design/pages/_view/lexicon_create_tuples?group=true"
        }).then(function(results) {
          if (localStorage.getItem(dbname + "lexiconResults")) {
            if (typeof callback == "function") {
              callback();
            }
            return;
          }
          var lexicon = results.rows;
          var sortedLexicon = {};
          for (var i in lexicon) {
            if (lexicon[i].key.gloss) {
              if (sortedLexicon[lexicon[i].key.morpheme]) {
                sortedLexicon[lexicon[i].key.morpheme].push({
                  gloss: lexicon[i].key.gloss,
                  value: lexicon[i].value
                });
              } else {
                sortedLexicon[lexicon[i].key.morpheme] = [{
                  gloss: lexicon[i].key.gloss,
                  value: lexicon[i].value
                }];
              }
            }
          }
          var sorter = function(a, b) {
            return b.value - a.value;
          };
          // Sort each morpheme array by descending value
          for (var key in sortedLexicon) {
            sortedLexicon[key].sort(sorter);
          }
          localStorage.setItem(dbname + "lexiconResults", JSON.stringify(sortedLexicon));

          // if (! self.get("lexiconNodes")){
          //   self.set("lexiconNodes", new LexiconNodes());
          // }
          // localStorage.setItem(dbname+"lexiconResults", JSON.stringify(results));
          // var lexiconTriples = results.rows;
          // for (triple in lexiconTriples) {
          //   self.get("lexiconNodes").add(new LexiconNode({
          //     morpheme : lexiconTriples[triple].key.morpheme,
          //     allomorphs : [ lexiconTriples[triple].key.morpheme ],
          //     gloss : lexiconTriples[triple].key.gloss,
          //     value : lexiconTriples[triple].value
          //   }));
          // }
          if (typeof callback == "function") {
            callback();
          }
        });
      },
      /**
       * Deprecated
       *
       * Overwrite/build the lexicon from local storage if it is there.
       *
       * @param dbname
       * @param callback
       */
      buildLexiconFromLocalStorage: function(dbname, callback) {
        // var results = localStorage.getItem(dbname+"lexiconResults");
        // if(!results){
        //   return;
        // }
        // if (! this.get("lexiconNodes")){
        //   this.set("lexiconNodes", new LexiconNodes());
        // }
        // var lexiconTriples = JSON.parse(results).rows;
        // for(triple in lexiconTriples){
        //   this.get("lexiconNodes").add(new LexiconNode({morpheme: lexiconTriples[triple].key.morpheme , allomorphs: [lexiconTriples[triple].key.morpheme], gloss: lexiconTriples[triple].key.gloss, value: lexiconTriples[triple].value}));
        // }
        if (typeof callback == "function") {
          callback();
        }
      },
      saveAndInterConnectInApp: function(callback) {

        if (typeof callback == "function") {
          callback();
        }
      }

    });

  return Lexicon;
});
