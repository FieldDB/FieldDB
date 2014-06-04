/* global window, OPrime */
var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var CorpusMask = require("./CorpusMask");
var Collection = require('./../Collection').Collection;
var Consultants = require('./../Collection').Collection;
var DatumFields = require('./../Collection').Collection;
var DatumStates = require('./../Collection').Collection;
var Comments = require('./../Collection').Collection;
var UserMask = require('./../Collection').Collection;
var Session = require('./../FieldDBObject').FieldDBObject;
var CORS = require('./../CORS').CORS;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var Permissions = require('./../Collection').Collection;
var Sessions = require('./../Collection').Collection;
var Q = require('q');


var DEFAULT_CORPUS_MODEL = require("./corpus.json");

/**
 * @class A corpus is like a git repository, it has a remote, a title
 *        a description and perhaps a readme When the user hits sync
 *        their "branch" of the corpus will be pushed to the central
 *        remote, and we will show them a "diff" of what has
 *        changed.
 *
 * The Corpus may or may not be a git repository, so this class is
 * to abstract the functions we would expect the corpus to have,
 * regardless of how it is really stored on the disk.
 *
 *
 * @property {String} title This is used to refer to the corpus, and
 *           what appears in the url on the main website eg
 *           http://fieldlinguist.com/LingLlama/SampleFieldLinguisticsCorpus
 * @property {String} description This is a short description that
 *           appears on the corpus details page
 * @property {String} remote The git url of the remote eg:
 *           git@fieldlinguist.com:LingLlama/SampleFieldLinguisticsCorpus.git
 *
 * @property {Consultants} consultants Collection of consultants who contributed to the corpus
 * @property {DatumStates} datumstates Collection of datum states used to describe the state of datums in the corpus
 * @property {DatumFields} datumfields Collection of datum fields used in the corpus
 * @property {ConversationFields} conversationfields Collection of conversation-based datum fields used in the corpus
 * @property {Sessions} sessions Collection of sessions that belong to the corpus
 * @property {DataLists} datalists Collection of data lists created under the corpus
 * @property {Permissions} permissions Collection of permissions groups associated to the corpus
 *
 *
 * @property {Glosser} glosser The glosser listens to
 *           orthography/utterence lines and attempts to guess the
 *           gloss.
 * @property {Lexicon} lexicon The lexicon is a list of morphemes,
 *           allomorphs and glosses which are used to index datum, and
 *           also to gloss datum.
 *
 * @description The initialize function probably checks to see if
 *              the corpus is new or existing and brings it down to
 *              the user's client.
 *
 * @extends FieldDBObject
 * @tutorial tests/CorpusTest.js
 */


var Corpus = function Corpus(options) {
  // console.log("Constructing corpus", options);
  FieldDBObject.apply(this, arguments);
};

Corpus.prototype = Object.create(FieldDBObject.prototype, /** @lends Corpus.prototype */ {
  constructor: {
    value: Corpus
  },

  title: {
    get: function() {
      return this._title || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._title) {
        return;
      }
      if (!value) {
        delete this._title;
        return;
      }
      this._title = value.trim();
      this._titleAsUrl = this._title;
    }
  },

  titleAsUrl: {
    get: function() {
      return this._titleAsUrl || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._titleAsUrl) {
        return;
      }
      if (!value) {
        delete this._titleAsUrl;
        return;
      }
      this._titleAsUrl = this._titleAsUrl.trim().toLowerCase().replace(/[!@#$^&%*()+=-\[\]\/{}|:<>?,."'`; ]/g, "_"); //this makes the accented char unnecessarily unreadable: encodeURIComponent(attributes.title.replace(/ /g,"_"));
    }
  },

  description: {
    get: function() {
      return this._description || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._description) {
        return;
      }
      if (!value) {
        delete this._description;
        return;
      }
      this._description = value.trim();
    }
  },

  couchConnection: {
    get: function() {
      throw "couchConnection is deprecated";
    },
    set: function(value) {
      console.warn("couchConnection is deprecated");
    }
  },

  replicatedCorpusUrls: {
    get: function() {
      return this._replicatedCorpusUrls || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this._replicatedCorpusUrls) {
        return;
      }
      if (!value) {
        delete this._replicatedCorpusUrls;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new Collection(value);
        }
      }
      this._replicatedCorpusUrls = value;
    }
  },

  olacExportConnections: {
    get: function() {
      return this._olacExportConnections || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this._olacExportConnections) {
        return;
      }
      if (!value) {
        delete this._olacExportConnections;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new Collection(value);
        }
      }
      this._olacExportConnections = value;
    }
  },

  termsOfUse: {
    get: function() {
      return this._termsOfUse || FieldDBObject.DEFAULT_OBJECT;
    },
    set: function(value) {
      if (value === this._termsOfUse) {
        return;
      }
      if (!value) {
        delete this._termsOfUse;
        return;
      }
      this._termsOfUse = value;
    }
  },

  license: {
    get: function() {
      return this._license || {};
    },
    set: function(value) {
      if (value === this._license) {
        return;
      }
      if (!value) {
        delete this._license;
        return;
      }
      this._license = value;
    }
  },

  copyright: {
    get: function() {
      return this._copyright || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._copyright) {
        return;
      }
      if (!value) {
        delete this._copyright;
        return;
      }
      this._copyright = value.trim();
    }
  },

  unserializedSessions:{
    value: null
  },
  sessions: {
    get: function() {
      return this.unserializedSessions || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this.unserializedSessions) {
        return;
      }
      if (!value) {
        delete this.unserializedSessions;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new Sessions(value);
        }
      }
      this.unserializedSessions = value;
    }
  },

  dateOfLastDatumModifiedToCheckForOldSession: {
    get: function() {
      var timestamp = 0;
      if (this.sessions && this.sessions.length > 0) {
        var mostRecentSession = this.sessions[this.sessions.length - 1];
        if (mostRecentSession.dateModified) {
          timestamp = mostRecentSession.dateModified;
        }
      }
      return new Date(timestamp);
    }
  },


  confidential: {
    get: function() {
      return this._confidential || FieldDBObject.DEFAULT_OBJECT;
    },
    set: function(value) {
      if (value === this._confidential) {
        return;
      }
      if (!value) {
        delete this._confidential;
        return;
      }
      this._confidential = value;
    }
  },

  publicCorpus: {
    get: function() {
      return this._publicCorpus || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._publicCorpus) {
        return;
      }
      if (!value) {
        delete this._publicCorpus;
        return;
      }
      if (value !== "Public" && value !== "Private") {
        console.warn("Corpora can be either Public or Private");
        value = "Private";
      }
      this._publicCorpus = value;
    }
  },

  _collection: {
    value: "private_corpuses"
  },
  collection: {
    get: function() {
      return this._collection;
    }
  },

  teamExternalObject: {
    value: null
  },
  team: {
    get: function() {
      return this.teamExternalObject;
    },
    set: function(value) {
      if (value === this.teamExternalObject) {
        return;
      }
      this.teamExternalObject = value;
    }
  },

  publicSelfExternalObject: {
    value: null
  },
  publicSelf: {
    get: function() {
      return this.publicSelfExternalObject;
    },
    set: function(value) {
      if (value === this.publicSelfExternalObject) {
        return;
      }
      this.publicSelfExternalObject = value;
    }
  },

  comments: {
    get: function() {
      return this._comments || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this._comments) {
        return;
      }
      if (!value) {
        delete this._comments;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new Collection(value);
        }
      }
      this._comments = value;
    }
  },

  validationStati: {
    get: function() {
      return this._validationStati || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this._validationStati) {
        return;
      }
      if (!value) {
        delete this._validationStati;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new Collection(value);
        }
      }
      this._validationStati = value;
    }
  },

  tags: {
    get: function() {
      return this._tags || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this._tags) {
        return;
      }
      if (!value) {
        delete this._tags;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new Collection(value);
        }
      }
      this._tags = value;
    }
  },

  datumFields: {
    get: function() {
      return this._datumFields || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this._datumFields) {
        return;
      }
      if (!value) {
        delete this._datumFields;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new Collection(value);
        }
      }
      this._datumFields = value;
    }
  },

  conversationFields: {
    get: function() {
      return this._conversationFields || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this._conversationFields) {
        return;
      }
      if (!value) {
        delete this._conversationFields;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new Collection(value);
        }
      }
      this._conversationFields = value;
    }
  },

  sessionFields: {
    get: function() {
      return this._sessionFields || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this._sessionFields) {
        return;
      }
      if (!value) {
        delete this._sessionFields;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new Collection(value);
        }
      }
      this._sessionFields = value;
    }
  },

  loadOrCreateCorpusByPouchName: {
    value: function(pouchname) {
      console.warn('TODO test loadOrCreateCorpusByPouchName');
      if (!pouchname) {
        throw "Cannot load corpus, its dbname was undefined";
      }
      var deferred = Q.defer(),
        self = this;

      pouchname = pouchname.trim();
      this.pouchname = pouchname;

      Q.nextTick(function() {

        var tryAgainInCaseThereWasALag = function(reason) {
          console.log(reason);
          if (self.runningloadOrCreateCorpusByPouchName) {
            deferred.reject(reason);
          }
          self.runningloadOrCreateCorpusByPouchName = true;
          window.setTimeout(function() {
            self.loadOrCreateCorpusByPouchName(pouchname);
          }, 1000);
        };

        CORS.makeCORSRequest({
          type: 'GET',
          dataType: 'json',
          url: self.url
        }).then(function(data) {
          console.log(data);
          if (data.rows && data.rows.length > 0) {
            self.runningloadOrCreateCorpusByPouchName = false;
            self.id = data.rows[0].value._id;
            self.fetch().then(deferred.resolve, deferred.reject);
          } else {
            tryAgainInCaseThereWasALag(data);
          }
        }, tryAgainInCaseThereWasALag);

      });

      return deferred.promise;
    }
  },

  fetchPublicSelf: {
    value: function() {
      console.warn('TODO test fetchPublicSelf');
      if (!this.pouchname) {
        throw "Cannot load corpus's public self, its dbname was undefined";
      }
      var deferred = Q.defer(),
        self = this;

      Q.nextTick(function() {

        if (self.publicSelf && self.publicSelf.rev) {
          deferred.resolve(self.publicSelf);
          return;
        }

        self.publicSelf = new CorpusMask({
          dbname: self.dbname
        });

        self.publicSelf.fetch()
          .then(deferred.resolve, deferred.reject);

      });
      return deferred.promise;
    }
  },

  /**
   * backbone-couchdb adaptor set up
   */

  // The couchdb-connector is capable of mapping the url scheme
  // proposed by the authors of Backbone to documents in your database,
  // so that you don't have to change existing apps when you switch the sync-strategy
  url: {
    value: "/private_corpuses"
  },

  loadPermissions: {
    value: function() {
      console.warn('TODO test loadPermissions');
      var deferred = Q.defer(),
        self = this;

      Q.nextTick(function() {

        if (!self.permissions) {
          self.permissions = new Permissions();
        }
        if (!self.permissions.pouchname) {
          self.permissions.pouchname = self.pouchname;
        }
        self.permissions.fetch()
          .then(deferred.resolve, deferred.reject);

      });
      return deferred.promise;
    }
  },

  pouchname: {
    get: function() {
      return this.dbname;
    },
    set: function(value) {
      if (this.dbname && this.dbname !== value) {
        throw "Cannot change the pouchname of a corpus, you must create a new object first.";
      }
      this.dbname = value;
    }
  },

  defaults: {
    get: function() {
      return DEFAULT_CORPUS_MODEL;
    }
  },

  INTERNAL_MODELS: {
    value: {
      _id: FieldDBObject.DEFAULT_STRING,
      _rev: FieldDBObject.DEFAULT_STRING,
      dbname: FieldDBObject.DEFAULT_STRING,
      version: FieldDBObject.DEFAULT_STRING,
      dateCreated: FieldDBObject.DEFAULT_DATE,
      dateModified: FieldDBObject.DEFAULT_DATE,
      comments: Comments,

      title: FieldDBObject.DEFAULT_STRING,
      titleAsUrl: FieldDBObject.DEFAULT_STRING,
      description: FieldDBObject.DEFAULT_STRING,
      termsOfUse: FieldDBObject,
      license: FieldDBObject,
      copyright: FieldDBObject.DEFAULT_STRING,
      replicatedCorpusUrls: Collection,
      olacExportConnections: Collection,
      publicCorpus: FieldDBObject.DEFAULT_STRING,
      confidential: Confidential,

      validationStati: DatumStates,
      tags: Collection,

      datumFields: DatumFields,
      conversationFields: DatumFields,
      sessionFields: DatumFields,
    }
  },

  /**
   * Make the  model marked as Deleted, mapreduce function will
   * ignore the deleted models so that it does not show in the app,
   * but deleted model remains in the database until the admin empties
   * the trash.
   *
   * Also remove it from the view so the user cant see it.
   *
   */
  putInTrash: {
    value: function() {
      OPrime.bug("Sorry deleting corpora is not available right now. Too risky... ");
      if (true) {
        return;
      }
      /* TODO contact server to delte the corpus, if the success comes back, then do this */
      this.trashed = "deleted" + Date.now();
      this.save();
    }
  },

  /**
   *  This the function called by the add button, it adds a new comment state both to the collection and the model
   * @type {Object}
   */
  newComment: {
    value: function(commentstring) {
      var m = {
        "text": commentstring,
      };

      this.comments.add(m);
      this.unsavedChanges = true;

      window.app.addActivity({
        verb: "commented",
        verbicon: "icon-comment",
        directobjecticon: "",
        directobject: "'" + commentstring + "'",
        indirectobject: "on <i class='icon-cloud'></i><a href='#corpus/" + this.id + "'>this corpus</a>",
        teamOrPersonal: "team",
        context: " via Offline App."
      });

      window.app.addActivity({
        verb: "commented",
        verbicon: "icon-comment",
        directobjecticon: "",
        directobject: "'" + commentstring + "'",
        indirectobject: "on <i class='icon-cloud'></i><a href='#corpus/" + this.id + "'>" + this.get('title') + "</a>",
        teamOrPersonal: "personal",
        context: " via Offline App."
      });

      return m;
    }
  },

  /**
   * Builds a new session in this corpus, copying the current session's fields (if available) or the corpus' session fields.
   * @return {Session} a new session for this corpus
   */
  newSession: {
    value: function() {
      var sessionFields;
      if (this.currentSession && this.currentSession.sessionFields) {
        sessionFields = this.currentSession.sessionFields.clone();
      } else {
        sessionFields = this.sessionFields.clone();
      }
      var session = new Session({
        pouchname: this.pouchname,
        sessionFields: sessionFields
      });
      return session;
    }
  },

  /**
   * Builds a new corpus based on this one (if this is not the team's practice corpus)
   * @return {Corpus} a new corpus based on this one
   */
  newCorpus: {
    value: function() {
      var newCorpusJson = this.clone();

      newCorpusJson.title = newCorpusJson.title + " copy";
      newCorpusJson.titleAsUrl = newCorpusJson.titleAsUrl + "Copy";
      newCorpusJson.description = "Copy of: " + newCorpusJson.description;

      newCorpusJson.pouchname = newCorpusJson.pouchname + "copy";
      newCorpusJson.replicatedCorpusUrls = newCorpusJson.replicatedCorpusUrls.map(function(remote) {
        return remote.replace(new RegExp(this.pouchname, "g"), newCorpusJson.pouchname);
      });

      newCorpusJson.comments = [];

      /* use default datum fields if this is going to based on teh users' first practice corpus */
      if (this.pouchname.indexOf("firstcorpus") > -1) {
        newCorpusJson.datumFields = DEFAULT_CORPUS_MODEL.datumFields;
        newCorpusJson.conversationFields = DEFAULT_CORPUS_MODEL.conversationFields;
        newCorpusJson.sessionFields = DEFAULT_CORPUS_MODEL.sessionFields;
      }
      var x;
      //clear out search terms from the new corpus's datum fields
      for (x in newCorpusJson.datumFields) {
        newCorpusJson.datumFields[x].mask = "";
        newCorpusJson.datumFields[x].value = "";
      }
      //clear out search terms from the new corpus's conversation fields
      for (x in newCorpusJson.conversationFields) {
        newCorpusJson.conversationFields[x].mask = "";
        newCorpusJson.conversationFields[x].value = "";
      }
      //clear out search terms from the new corpus's session fields
      for (x in newCorpusJson.sessionFields) {
        newCorpusJson.sessionFields[x].mask = "";
        newCorpusJson.sessionFields[x].value = "";
      }

      return new Corpus(newCorpusJson);
    }
  },

  /**
   * DO NOT store in attributes when saving to pouch (too big)
   * @type {FieldDBGlosser}
   */
  glosser: {
    get: function() {
      return this.glosserExternalObject;
    },
    set: function(value) {
      if (value === this.glosserExternalObject) {
        return;
      }
      this.glosserExternalObject = value;
    }
  },

  lexicon: {
    get: function() {
      return this.lexiconExternalObject;
    },
    set: function(value) {
      if (value === this.lexiconExternalObject) {
        return;
      }
      this.lexiconExternalObject = value;
    }
  },

  prepareANewOfflinePouch: {
    value: function() {
      throw "I dont know how to prepareANewOfflinePouch";
    }
  },

  /**
   * Accepts two functions to call back when save is successful or
   * fails. If the fail callback is not overridden it will alert
   * failure to the user.
   *
   * - Adds the corpus to the corpus if it is in the right corpus, and wasn't already there
   * - Adds the corpus to the user if it wasn't already there
   * - Adds an activity to the logged in user with diff in what the user changed.
   * @return {Promise} promise for the saved corpus
   */
  saveCorpus: {
    value: function() {
      var deferred = Q.defer(),
        self = this;

      var newModel = false;
      if (!this.id) {
        console.log('New corpus');
        newModel = true;
      } else {
        console.log('Existing corpus');
      }
      var oldrev = this.get("_rev");

      this.timestamp = Date.now();

      self.unsavedChanges = false;
      self.save().then(function(model) {
        var title = model.title;
        var differences = "#diff/oldrev/" + oldrev + "/newrev/" + model._rev;
        var verb = "modified";
        var verbicon = "icon-pencil";
        if (newModel) {
          verb = "added";
          verbicon = "icon-plus";
        }
        var teamid = self.pouchname.split("-")[0];
        window.app.addActivity({
          verb: "<a href='" + differences + "'>" + verb + "</a> ",
          verbmask: verb,
          verbicon: verbicon,
          directobject: "<a href='#corpus/" + model.id + "'>" + title + "</a>",
          directobjectmask: "a corpus",
          directobjecticon: "icon-cloud",
          indirectobject: "created by <a href='#user/" + teamid + "'>" + teamid + "</a>",
          context: " via Offline App.",
          contextmask: "",
          teamOrPersonal: "personal"
        });
        window.app.addActivity({
          verb: "<a href='" + differences + "'>" + verb + "</a> ",
          verbmask: verb,
          verbicon: verbicon,
          directobject: "<a href='#corpus/" + model.id + "'>" + title + "</a>",
          directobjectmask: "a corpus",
          directobjecticon: "icon-cloud",
          indirectobject: "created by <a href='#user/" + teamid + "'>this team</a>",
          context: " via Offline App.",
          contextmask: "",
          teamOrPersonal: "team"
        });
        deferred.resolve(self);
      }, deferred.reject);

      return deferred.promise;
    }
  },

  /**
   * If more views are added to corpora, add them here
   * @returns {} an object containing valid map reduce functions
   * TODO: add conversation search to the get_datum_fields function
   */
  validDBQueries: {
    value: function() {
      return {
        activities: {
          url: "/_design/pages/_view/activities",
          map: require("./../../couchapp_dev/views/activities/map")
        },
        add_synctactic_category: {
          url: "/_design/pages/_view/add_synctactic_category",
          map: require("./../../couchapp_dev/views/add_synctactic_category/map")
        },
        audioIntervals: {
          url: "/_design/pages/_view/audioIntervals",
          map: require("./../../couchapp_dev/views/audioIntervals/map")
        },
        byCollection: {
          url: "/_design/pages/_view/byCollection",
          map: require("./../../couchapp_dev/views/byCollection/map")
        },
        by_date: {
          url: "/_design/pages/_view/by_date",
          map: require("./../../couchapp_dev/views/by_date/map")
        },
        by_rhyming: {
          url: "/_design/pages/_view/by_rhyming",
          map: require("./../../couchapp_dev/views/by_rhyming/map"),
          reduce: require("./../../couchapp_dev_/by_rhyming/reduce")
        },
        cleaning_example: {
          url: "/_design/pages/_view/cleaning_example",
          map: require("./../../couchapp_dev/views/cleaning_example/map")
        },
        corpuses: {
          url: "/_design/pages/_view/corpuses",
          map: require("./../../couchapp_dev/views/corpuses/map")
        },
        datalists: {
          url: "/_design/pages/_view/datalists",
          map: require("./../../couchapp_dev/views/datalists/map")
        },
        datums: {
          url: "/_design/pages/_view/datums",
          map: require("./../../couchapp_dev/views/datums/map")
        },
        datums_by_user: {
          url: "/_design/pages/_view/datums_by_user",
          map: require("./../../couchapp_dev/views/datums_by_user/map"),
          reduce: require("./../../couchapp_dev_/datums_by_user/reduce")
        },
        datums_chronological: {
          url: "/_design/pages/_view/datums_chronological",
          map: require("./../../couchapp_dev/views/datums_chronological/map")
        },
        deleted: {
          url: "/_design/pages/_view/deleted",
          map: require("./../../couchapp_dev/views/deleted/map")
        },
        export_eopas_xml: {
          url: "/_design/pages/_view/export_eopas_xml",
          map: require("./../../couchapp_dev/views/export_eopas_xml/map"),
          reduce: require("./../../couchapp_dev_/export_eopas_xml/reduce")
        },
        get_corpus_datum_tags: {
          url: "/_design/pages/_view/get_corpus_datum_tags",
          map: require("./../../couchapp_dev/views/get_corpus_datum_tags/map"),
          reduce: require("./../../couchapp_dev_/get_corpus_datum_tags/reduce")
        },
        get_corpus_fields: {
          url: "/_design/pages/_view/get_corpus_fields",
          map: require("./../../couchapp_dev/views/get_corpus_fields/map")
        },
        get_corpus_validationStati: {
          url: "/_design/pages/_view/get_corpus_validationStati",
          map: require("./../../couchapp_dev/views/get_corpus_validationStati/map"),
          reduce: require("./../../couchapp_dev_/get_corpus_validationStati/reduce")
        },
        get_datum_fields: {
          url: "/_design/pages/_view/get_datum_fields",
          map: require("./../../couchapp_dev/views/get_datum_fields/map")
        },
        get_datums_by_session_id: {
          url: "/_design/pages/_view/get_datums_by_session_id",
          map: require("./../../couchapp_dev/views/get_datums_by_session_id/map")
        },
        get_frequent_fields: {
          url: "/_design/pages/_view/get_frequent_fields",
          map: require("./../../couchapp_dev/views/get_frequent_fields/map"),
          reduce: require("./../../couchapp_dev_/get_frequent_fields/reduce")
        },
        get_search_fields_chronological: {
          url: "/_design/pages/_view/get_search_fields_chronological",
          map: require("./../../couchapp_dev/views/get_search_fields_chronological/map")
        },
        glosses_in_utterance: {
          url: "/_design/pages/_view/glosses_in_utterance",
          map: require("./../../couchapp_dev/views/glosses_in_utterance/map"),
          reduce: require("./../../couchapp_dev_/glosses_in_utterance/reduce")
        },
        lexicon_create_tuples: {
          url: "/_design/pages/_view/lexicon_create_tuples",
          map: require("./../../couchapp_dev/views/lexicon_create_tuples/map"),
          reduce: require("./../../couchapp_dev_/lexicon_create_tuples/reduce")
        },
        morpheme_neighbors: {
          url: "/_design/pages/_view/morpheme_neighbors",
          map: require("./../../couchapp_dev/views/morpheme_neighbors/map"),
          reduce: require("./../../couchapp_dev_/morpheme_neighbors/reduce")
        },
        morphemes_in_gloss: {
          url: "/_design/pages/_view/morphemes_in_gloss",
          map: require("./../../couchapp_dev/views/morphemes_in_gloss/map"),
          reduce: require("./../../couchapp_dev_/views/morphemes_in_gloss/reduce")
        },
        recent_comments: {
          url: "/_design/pages/_view/recent_comments",
          map: require("./../../couchapp_dev/views/recent_comments/map")
        },
        sessions: {
          url: "/_design/pages/_view/sessions",
          map: require("./../../couchapp_dev/views/sessions/map")
        },
        users: {
          url: "/_design/pages/_view/users",
          map: require("./../../couchapp_dev/views/users/map")
        },
        word_list: {
          url: "/_design/pages/_view/word_list",
          map: require("./../../couchapp_dev/views/word_list/map"),
          reduce: require("./../../couchapp_dev_/word_list/reduce")
        },
        couchapp_dev_word_list_rdf: {
          url: "/_design/pages/_view/couchapp_dev_word_list_rdf",
          map: require("./../../couchapp_dev_word_list_rdf/map"),
          reduce: require("./../../couchapp_dev_word_list_rdf/reduce")
        }
      };
    }
  },

  validate: {
    value: function(attrs) {
      attrs = attrs || this;
      if (attrs.publicCorpus) {
        if (attrs.publicCorpus !== "Public") {
          if (attrs.publicCorpus !== "Private") {
            return "Corpus must be either Public or Private"; //TODO test this.
          }
        }
      }
    }
  },

  /**
   * This function takes in a pouchname, which could be different
   * from the current corpus in case there is a master corpus with
   * more/better monolingual data.
   *
   * @param pouchname
   * @param callback
   */
  buildMorphologicalAnalyzerFromTeamServer: {
    value: function(pouchname, callback) {
      if (!pouchname) {
        pouchname = this.pouchname;
      }
      this.glosser.downloadPrecedenceRules(pouchname, this.glosserURL, callback);
    }
  },
  /**
   * This function takes in a pouchname, which could be different
   * from the current corpus incase there is a master corpus wiht
   * more/better monolingual data.
   *
   * @param pouchname
   * @param callback
   */
  buildLexiconFromTeamServer: {
    value: function(pouchname, callback) {
      if (!pouchname) {
        pouchname = this.pouchname;
      }
      this.lexicon.buildLexiconFromCouch(pouchname, callback);
    }
  },

  /**
   * This function takes in a pouchname, which could be different
   * from the current corpus incase there is a master corpus wiht
   * more representative datum
   * example : https://corpusdev.lingsync.org/lingllama-cherokee/_design/pages/_view/get_frequent_fields?group=true
   *
   * It takes the values stored in the corpus, if set, otherwise it will take the values from this corpus since the window was last refreshed
   *
   * If a url is passed, it contacts the server for fresh info.
   *
   * @param pouchname
   * @param callback
   */
  getFrequentDatumFields: {
    value: function() {
      return this.getFrequentValues("fields", ["judgement", "utterance", "morphemes", "gloss", "translation"]);
    }
  },

  /**
   * This function takes in a pouchname, which could be different
   * from the current corpus incase there is a master corpus wiht
   * more representative datum
   * example : https://corpusdev.lingsync.org/lingllama-cherokee/_design/pages/_view/get_corpus_validationStati?group=true
   *
   * It takes the values stored in the corpus, if set, otherwise it will take the values from this corpus since the window was last refreshed
   *
   * If a url is passed, it contacts the server for fresh info.
   *
   * @param pouchname
   * @param callback
   */
  getFrequentDatumValidationStates: {
    value: function() {
      return this.getFrequentValues("validationStatus", ["Checked", "Deleted", "ToBeCheckedByAnna", "ToBeCheckedByBill", "ToBeCheckedByClaude"]);
    }
  },

  getFrequentValues: {
    value: function(fieldname, defaults) {
      var deferred = Q.defer(),
        self;

      if (!defaults) {
        defaults = self["defaultFrequentDatum" + fieldname];
      }

      /* if we have already asked the server in this page load, return */
      if (self["frequentDatum" + fieldname]) {
        Q.nextTick(function() {
          deferred.resolve(self["frequentDatum" + fieldname]);
        });
        return deferred.promise;
      }

      var jsonUrl = self.validDBQueries["get_corpus_" + fieldname].url + "?group=true&limit=100";
      OPrime.makeCORSRequest({
        type: 'GET',
        dataType: "json",
        url: jsonUrl,
      }).then(function(serverResults) {
        var frequentValues;
        if (serverResults && serverResults.rows && serverResults.row.length > 2) {
          frequentValues = serverResults.rows.map(function(fieldvalue) {
            return fieldvalue.key;
          });
        } else {
          frequentValues = defaults;
        }

        /*
         * TODO Hide optionally specified values
         */

        self["frequentDatum" + fieldname] = frequentValues;
        deferred.resolve(frequentValues);
      }, function(response) {
        console.log("resolving defaults for frequentDatum" + fieldname, response);
        deferred.resolve(defaults);
      });

      return deferred.promise;
    }
  },
  /**
   * This function takes in a pouchname, which could be different
   * from the current corpus incase there is a master corpus wiht
   * more representative datum
   * example : https://corpusdev.lingsync.org/lingllama-cherokee/_design/pages/_view/get_corpus_validationStati?group=true
   *
   * It takes the values stored in the corpus, if set, otherwise it will take the values from this corpus since the window was last refreshed
   *
   * If a url is passed, it contacts the server for fresh info.
   *
   * @param pouchname
   * @param callback
   */
  getFrequentDatumTags: {
    value: function() {
      return this.getFrequentValues("tags", ["Passive", "WH", "Indefinte", "Generic", "Agent-y", "Causative", "Pro-drop", "Ambigous"]);
    }
  },
  changeCorpusPublicPrivate: {
    value: function() {
      //      alert("TODO contact server to change the public private of the corpus");
      throw " I dont know how change this corpus' public/private setting ";
    }
  }
});

exports.Corpus = Corpus;
