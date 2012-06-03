define(
    [ "use!backbone", "use!handlebars", "text!corpus/corpus.handlebars",
        "corpus/Corpus", "session/Session", "session/Sessions",
        "session/SessionView", "session/SessionsView", "datum/Datums",
        "datum/DatumsView", "data_list/DataLists", "data_list/DataListView",
        "data_list/DataListsView", "permission/Permissions",
        "permission/PermissionView", "permission/PermissionsView",
        "lexicon/Lexicon", "lexicon/LexiconView", "glosser/Glosser",
        "glosser/GlosserView" ],
    function(Backbone, Handlebars, corpusTemplate, Corpus, Session, Sessions,
        SessionView, SessionsView, Datums, DatumsView, DataLists, DataListView,
        DataListsView, Permissions, PermissionView, PermissionsView, Lexicon,
        LexiconView, Glosser, GlosserView) {
      var CorpusView = Backbone.View
          .extend(
          /** @lends CorpusView.prototype */
          {
            /**
             * @class This is the corpus view. To the user it looks like a
             *        Navigation panel on the main dashboard screen, which
             *        displays a menu of things the User can do (ex. open a new
             *        session, browse all entries, etc.).
             * 
             * @property {Import} importer The importer is an Importer object
             *           which attaches itself to the document page on Chrome
             *           Extensions and non-mobile browsers to listen to drag
             *           and drop events and attempt to import the contents of
             *           the dragged and dropped files. On android the app will
             *           have to import data via the menus.
             * 
             * @extends Backbone.View
             * @constructs
             */

            initialize : function() {
              // this.on('all', function(e) {
              // this.render();
              // });
              // this.model.bind('change', this.render);
              this.sessionView = new SessionView({
                model : new Session()
              });
              this.render();
            },
            events : {
              "change" : "render",
//              "click .new_datum" : "newDatum",
//              "click .new_session" : "newSession",
//              "click .show_data_lists" : "showDataLists",
//              "click .show_corpus_details" : "showCorpusDetails",
//              "click .show_sessions" : "showSessions",
//              "click .show_permissions" : "showPermissions",
//              "click .show_corpora" : "showCorpora",
//              "click .import" : "newImport",
//              "click .export" : "showExport"

            },
            model : Corpus,
            template : Handlebars.compile(corpusTemplate),
            el : '#corpus',

            sessions : Sessions,
            sessionView : SessionView,
            sessionsView : SessionsView,

            datums : Datums,
            // DatumView will be show using 1 page in a paginated datumsview
            datumsView : DatumsView,

            dataLists : DataLists,
            dataListView : DataListView,
            dataListsView : DataListsView,

            permissions : Permissions,
            permissionView : PermissionView,
            permissionsView : PermissionsView,

            lexicon : Lexicon,
            lexicon : LexiconView,

            glosser : Glosser,
            glosser : GlosserView,

            render : function() {
              if (this.model != undefined) {
                Handlebars.registerPartial("session", this.sessionView
                    .template(this.sessionView.model.toJSON()));

                $(this.el).html(this.template(this.model.toJSON()));
                console.log("\trendering corpus: " + this.model.get("name"));
              } else {
                console.log("\tCorpus model was undefined.");
              }
              return this;
            },
            loadSample : function() {
              this.model.set("name", "Sample Quechua Corpus");
              this.model
                  .set(
                      "description",
                      "This is a corpus which will let you explore the app and see how it works. "
                          + "\nIt contains some data from one of our trips to Cusco, Peru.");
              this.sessionView = new SessionView({
                model : new Session({
                  user : "sapir",
                  informant : "Tillohash",
                  corpus : this.model,
                  language : "Cusco Quechua",
                  goal : "Working on naya"

                })
              });

              this.render();
            }

          });

      return CorpusView;
    });