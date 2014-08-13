var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

/**
 * @class The CorpusMask is saved as corpus in the Couch repository,
 *        it is the publicly visible version of a corpus. By default it just says "This
 *        corpus is private," when users decide to make some aspects of their corpsu
 *        public they can customize the fields in their "corpus" object to display
 *        only certain sorts of data, even though the corpus is publicly discoverable.
 *
 * @property {String} title This is the title of the corpus, as set by the corpus
 *           team. It can contain any UTF-8 character.
 * @property {String} titleAsUrl This is what appears in the url on the main website.
 *           It is based on the title of the corpus and can be changed and looks
 *           nicer than the dbname which cannot be changed. eg
 *           http://fieldlinguist.com/LingLlama/SampleFieldLinguisticsCorpus
 * @property {String} description This is a short description that
 *           appears on the corpus details page
 * @property {Object} termsOfUse Terms of use set by the corpus team, includes
 *           a field for humanReadable terms which are displayed on the corpus
 *           and included in corpus exports.
 * @property {Object} license License set by the corpus team, includes a field
 *           for humanReadable terms which are displayed on the corpus and
 *           included in corpus exports, as well as a link to the license, imageUrl
 *           for the image/logo of the license for easy recognition and
 *           title of the license.
 * @property {Object} copyright Who owns the copyright to the corpus,
 *           by default it is set to the corpus team's name but teams can customize
 *           it for example to make the corpus copyright of the language community
 *           or speakers who contributed to the corpus.
 * @property {Object} location GPS location of the corpus (longitude, latitude and accuracy)
 *           The corpus can be plotted on a map using the accuracy as a radius
 *           of roughly where the data is from.
 * @property {String} remote The url of the remote eg:
 *           git@fieldlinguist.com:LingLlama/SampleFieldLinguisticsCorpus.git
 * @property {Array} couchConnections The url of couch remote(s) where the
 *           corpus is replicated or backed up.
 * @property {Array} olacConnections The url of OLAC remote(s) where the corpus
 *           is archived or published.
 *
 * @property {Array} members Collection of public browsable/search engine
 *           discoverable members associated to the corpus
 * @property {Array} datumstates Collection of datum states for which data are
 *           will be public browsable/search engine discoverable in the corpus. This
 *           can be used to only show polished data or "checked" data on the public
 *           page for example.
 * @property {Array} datumfields Collection of datum fields which will be
 *           public browsable/search engine discoverable  on public datum in the corpus
 * @property {Array} sessions Collection of public browsable/search engine
 *           discoverable sessions that belong to the corpus
 * @property {Array} datalists Collection of public browsable/search engine
 *           discoverable data lists created under the corpus
 *
 * @extends FieldDBObject
 * @tutorial tests/CorpusTest.js
 */
var CorpusMask = function CorpusMask(options) {
  this.debug(options);
  FieldDBObject.apply(this, arguments);

};

CorpusMask.prototype = Object.create(FieldDBObject.prototype, /** @lends CorpusMask.prototype */ {
  constructor: {
    value: CorpusMask
  },

  _id: {
    value: "corpus"
  },

  id: {
    get: function() {
      return this._id;
    },
    set: function() {
      console.warn("CorpusMask id cannot be set.");
      return;
    }
  },

  url: {
    value: "/corpora"
  },

  fillWithDefaults: {
    value: function() {
      this.title = "Private Corpus";
      this.titleAsUrl = "PrivateCorpus";
      this.description = "The details of this corpus are not public.";
      this.location = {
        "latitude": 0,
        "longitude": 0,
        "accuracy": 0
      };
      this.couchConnections = [];
      this.olacConnections = [];
      this.termsOfUse = {
        "humanReadable": "Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
      };
      this.license = {
        "title": "Default: Creative Commons Attribution-ShareAlike (CC BY-SA).",
        "humanReadable": "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
        "imageUrl": "",
        "link": "http://creativecommons.org/licenses/by-sa/3.0/"
      };
      this.copyright = "Default: Add names of the copyright holders of the corpus.";

      /* By default all data is limited to Checked and Published validation status */
      if (!this.datumStates) {
        this.datumStates = [{
          state: "Checked*",
          color: "green"
        }, {
          state: "Published*",
          color: "blue"
        }];
      }

      /* These fields are visible to public if the team makes the corpus public */
      if (!this.datumFields) {
        this.datumFields = [{
          label: "judgement",
          labelMachine: "judgement",
          size: "3",
          help: "Acceptablity judgement (*,#,?  mean this sentence is strange)",
          helpLinguist: "Gramaticality/acceptablity judgement (Ungrammatical:*, Nonfelicitous:#, Unknown:?)"
        }, {
          label: "utterance",
          labelMachine: "utterance",
          help: "What was said/written",
          helpLinguist: "Line 1 in examples for handouts (ie, either Orthography, or phonemic/phonetic representation)"
        }, {
          label: "morphemes",
          labelMachine: "morphemes",
          help: "Words divided into prefixes, root and suffixes using a - between each eg: prefix-prefix-root-suffix-suffix-suffix",
          helpLinguist: "Morpheme segmentation"
        }, {
          label: "gloss",
          labelMachine: "gloss",
          help: "Translation for each prefix, root and suffix in the words",
          helpLinguist: "Glosses for morphemes"
        }, {
          label: "translation",
          labelMachine: "translation",
          help: "Translation into English/Spanish/Russian, or simply a language the team is comfortable with. There may also be additional languages in the other fields.",
          helpLinguist: "The team's primary translation. It might not be English, just a language the team is comfortable with. There may also be additional languages in the other fields."
        }];
      } //end if to set datumFields

      //Removed goal and consultants by default, keeping language and dialect since these seem okay to make public
      if (!this.sessionFields) {
        this.sessionFields = [{
          label: "dialect",
          labelMachine: "dialect",
          help: "Dialect of this example (city, village, region etc)",
          helpLinguist: "This dialect may be as precise as the team chooses (province, region, city, village or any other measure of dialect)"
        }, {
          label: "register",
          labelMachine: "register",
          help: "Social register of this example (friends, children speaking with children, formal, religious, ceremonial etc)",
          helpLinguist: "This is an optional field which indicates the social register of the example (friends, children speaking with children, formal, religious, ceremonial etc)"
        }, {
          label: "language",
          labelMachine: "language",
          language: {
              ethnologueUrl: "",
              wikipediaUrl: "",
              iso: "",
              locale: "",
              englishName: "",
              nativeName: "",
              alternateNames: ""
            },
          help: "This is the langauge (or language family)",
          helpLinguist: "This is the langauge (or language family)"
        }, {
          label: "source",
          labelMachine: "consultant",
          help: "This is the source of the data (publication, document, person)",
        }, {
          label: "location",
          labelMachine: "location",
          location: {
              latitude: 0,
              longitude: 0,
              accuracy: 0
          },
          help: "This is the gps location of the elicitation session (if available)",
        }, {
          label: "dateElicited",
          labelMachine: "dateElicited",
          help: "This is the date in which the session took place.",
          timestamp: null,
          timestampAccuracy: ""
        }];
      } //end if to set sessionFields

      // If there are no comments, create models
      if (!this.comments) {
        this.comments = [];
      }

      if (!this.members) {
        this.members = [];
      }
      if (!this.datalists) {
        this.datalists = [];
      }
      if (!this.sessions) {
        this.sessions = [];
      }
    }
  },

  defaults: {
    value: {
      title: "Unknown",
      titleAsUrl: "Unknown",
      description: "The details of this corpus are not available.",
      location: {
        "latitude": 0,
        "longitude": 0,
        "accuracy": 0
      },
      members: [],
      datumStates: [],
      datumFields: [],
      sessionFields: [],
      datalists: [],
      sessions: [],
      couchConnections: [],
      olacConnections: []
    }
  },

  internalModels: {
    value: {
      members: "UserMask",
      datumStates: "DatumState",
      datumFields: "DatumField",
      sessionFields: "DatumField",
      searchFields: "DatumField",
      sessions: "Session",
      dataLists: "DataList",
      permissions: "Permission",
      comments: "Comment"
    }
  },

  save: {
    value: function(successcallback, failurecallback) {
      var self = this;
      self._id = "corpus";
      this.timestamp = Date.now();

      self.pouch(function(err, db) {
        var modelwithhardcodedid = self.toJSON();
        modelwithhardcodedid._id = "corpus";
        db.put(modelwithhardcodedid, function(err, response) {
          if (err) {
            if (err.status === "409") {
              //find out what the rev is in the database by fetching
              self.fetch({
                success: function(model, response) {
                  self.debug(response);
                  modelwithhardcodedid._rev = self._rev;

                  db.put(modelwithhardcodedid, function(err, response) {
                    if (err) {
                      if (typeof failurecallback === "function") {
                        failurecallback();
                      }
                    } else {
                      self.debug(response);
                      //this happens on subsequent save into pouch of this CorpusMask's id
                      if (typeof successcallback === "function") {
                        successcallback();
                      }
                    }
                  });

                },
                //fetch error
                error: function(e) {
                  self.debug(e);
                  if (typeof failurecallback === "function") {
                    failurecallback();
                  }
                }
              });
            } else {
              //this is a real error, not a conflict error
              if (typeof failurecallback === "function") {
                failurecallback();
              }
            }
          } else {
            self.debug(response);
            if (typeof successcallback === "function") {
              successcallback();
            }
          }
        });
      });
    }
  },

  title: {
    get: function() {
      if (!this._title) {
        this._title = "";
      }
      return this._title;
    },
    set: function(value) {
      if (value === this._title) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._title = value.trim();
      this._titleAsUrl = this._title.toLowerCase().replace(/[!@#$^&%*()+=-\[\]\/{}|:<>?,."'`; ]/g, "_"); //this makes the accented char unnecessarily unreadable: encodeURIComponent(attributes.title.replace(/ /g,"_"));

    }
  },

  description: {
    get: function() {
      if (!this._description) {
        this._description = "";
      }
      return this._description;
    },
    set: function(value) {
      if (value === this._description) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._description = value.trim();
    }
  }
});
exports.CorpusMask = CorpusMask;
