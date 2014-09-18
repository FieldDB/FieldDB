/* globals FieldDB */
var Datum = require("./../FieldDBObject").FieldDBObject;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var Document = require("./../datum/Document").Document;
var DocumentCollection = require("./../datum/DocumentCollection").DocumentCollection;
var Comments = require("./../comment/Comments").Comments;
var ContextualizableObject = require('./../locales/ContextualizableObject').ContextualizableObject;
var Q = require("q");

/**
 * @class The Data List widget is used for import search, to prepare handouts and to share data on the web.
 *  @name  DataList
 *
 * @description The Data List widget is used for import search, to prepare handouts and to share data on the web.
 *
 * @property {String} title The title of the Data List.
 * @property {String} description The description of the Data List.
 * @property {Array<String>} datumIds Deprecated: An ordered list of the datum IDs of the
 *   Datums in the Data List.
 * @property {Array<String>} docIds An ordered list of the doc IDs of the
 *   Datums in the Data List.
 * @property {Array<String>} docs An ordered collection of the doc IDs of the
 *   Datums in the Data List (not serialized in the DataList)
 *
 * @extends FieldDBObject
 * @constructs
 */
var DataList = function DataList(options) {
  this.debug("Constructing DataList ", options);
  if (options && options.comments) {
    // console.log("DataList comments", options.comments);
    // console.log("DataList comments", options.comments);
  }
  FieldDBObject.apply(this, arguments);
};

DataList.prototype = Object.create(FieldDBObject.prototype, /** @lends DataList.prototype */ {
  constructor: {
    value: DataList
  },

  api: {
    get: function() {
      return this._api || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._api) {
        return;
      }
      if (!value) {
        delete this._api;
        return;
      }
      if (value.trim) {
        value = value.trim();
      }
      this._api = value;
    }
  },

  defaults: {
    get: function() {
      return {
        title: "Untitled Data List",
        description: "",
        datumIds: FieldDBObject.DEFAULT_ARRAY,
        docs: FieldDBObject.DEFAULT_COLLECTION
      };
    }
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      comments: Comments,
      docs: DocumentCollection,
      title: ContextualizableObject,
      description: ContextualizableObject
    }
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
      if (value.trim) {
        value = value.trim();
      }
      this._title = value;
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
      if (value.trim) {
        value = value.trim();
      }
      this._description = value;
    }
  },

  docs: {
    get: function() {
      return this._docs;
    },
    set: function(value) {
      if (value === this._docs) {
        return;
      }
      if (!value) {
        delete this._docs;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]' && typeof this.INTERNAL_MODELS['docs'] === 'function') {
          value = new this.INTERNAL_MODELS['docs'](value);
        }
      }
      this._docs = value;
    }
  },

  add: {
    value: function(value) {
      if (!this.docs) {
        this.docs = [];
      }
      this.docs.add(value);
    }
  },

  populate: {
    value: function(results) {
      var self = this;

      this.docs = this.docs || [];
      results.map(function(doc) {
        try {
          var guessedType = doc.type;
          if (!guessedType) {
            self.debug(" requesting guess type ");
            guessedType = Document.prototype.guessType(doc)
            self.debug("request complete");
          }
          doc.confidential = self.confidential;
          doc.api = self.api;
          self.debug('Converting doc into type ' + guessedType);

          if (guessedType === "Datum") {
            doc = new Datum(doc);
          } else if (guessedType === "Document") {
            doc._type = guessedType;
            doc = new Document(doc);
          } else if (guessedType === "FieldDBObject") {
            doc = new FieldDBObject(doc);
          } else if (FieldDB[guessedType]) {
            self.warn('Converting doc into guessed type ' + guessedType);
            doc = new FieldDB[guessedType](doc);
          } else {
            self.warn('This doc does not have a type than can be used, it might display oddly ', doc);
            doc = new FieldDBObject(doc);
          }

        } catch (e) {
          self.warn("error converting this doc: " + JSON.stringify(doc) + e);
          var guessedType = "FieldDBObject";
          doc.confidential = self.confidential;
          doc = new FieldDBObject(doc);
        }
        self.debug("adding doc", doc);
        self.docs.add(doc);
        if (doc.type === 'Datum') {
          self.showDocPosition = true;
          self.showDocCheckboxes = true;
          self.docsAreReorderable = true;
        }
      });
    }
  },

  docIds: {
    get: function() {
      var self = this;

      if ((!this._docIds || this._docIds.length === 0) && (this.docs && this.docs.length > 0)) {
        this._docIds = this.docs.map(function(doc) {
          self.debug('geting doc id of this doc ', doc);
          return doc.id;
        });
      }
      return this._docIds || FieldDBObject.DEFAULT_ARRAY;
    },
    set: function(value) {
      if (value === this._docIds) {
        return;
      }
      if (!value) {
        delete this._docIds;
        return;
      }
      this._docIds = value;
    }
  },

  datumIds: {
    get: function() {
      this.warn("datumIds is deprecated, please use docIds instead.");
      return this.docIds;
    },
    set: function(value) {
      this.warn("datumIds is deprecated, please use docIds instead.");
      this.docIds = value;
    }
  },

  decryptedMode: {
    get: function() {
      return this.decryptedMode;
    },
    set: function(value) {
      this.decryptedMode = value;
      this.docs.decryptedMode = value;
    }
  },

  icon: {
    get: function() {
      return "thumb-tack";
    }
  },

  getAllAudioAndVideoFiles: {
    value: function(datumIdsToGetAudioVideo) {
      var deferred = Q.defer(),
        self = this;

      Q.nextTick(function() {

        if (!datumIdsToGetAudioVideo) {
          datumIdsToGetAudioVideo = self.docIds;
        }
        if (datumIdsToGetAudioVideo.length === 0) {
          datumIdsToGetAudioVideo = self.docIds;
        }
        var audioVideoFiles = [];
        self.debug("DATA LIST datumIdsToGetAudioVideo " + JSON.stringify(datumIdsToGetAudioVideo));
        datumIdsToGetAudioVideo.map(function(id) {
          var doc = self.docs[id];
          if (doc) {
            if (doc.audioVideo) {
              doc.audioVideo.map(function(audioVideoFile) {
                audioVideoFiles.push(audioVideoFile.URL);
              });
            }
          } else {
            var obj = new Datum({
              pouchname: self.dbname,
              id: id
            });
            obj.fetch().then(function(results) {
              this.debug("Fetched datum to get audio file", results);
              if (doc.audioVideo) {

                obj.audioVideo.map(function(audioVideoFile) {
                  audioVideoFiles.push(audioVideoFile.URL);
                });
              }
            });
          }
        });
        deferred.resolve(audioVideoFiles);

      });
      return deferred.promise;
    }
  },

  applyFunctionToAllIds: {
    value: function(datumIdsToApplyFunction, functionToApply, functionArguments) {
      if (!datumIdsToApplyFunction) {
        datumIdsToApplyFunction = this.docIds;
      }
      if (datumIdsToApplyFunction.length === 0) {
        datumIdsToApplyFunction = this.docIds;
      }
      if (!functionToApply) {
        functionToApply = "latexitDataList";
      }
      if (!functionArguments) {
        //        functionArguments = true; //leave it null so that the defualts will apply in the Datum call
      }

      var self = this;
      this.debug("DATA LIST datumIdsToApplyFunction " + JSON.stringify(datumIdsToApplyFunction));
      datumIdsToApplyFunction.map(function(id) {
        var doc = self.docs[id];
        if (doc) {
          doc[functionToApply].apply(doc, functionArguments);
          return id;
        } else {
          self.warn(" Doc has not been fetched, cant apply the function to it.");
          return id;
        }
      });
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);
      // Force docIds to be set to current docs
      this.docIds = null;
      this.docIds = this.docIds;
      var json = FieldDBObject.prototype.toJSON.apply(this, arguments);
      delete json.docs;
      this.todo("Adding datumIds for backward compatability until prototype can handle docIds");
      json.datumIds = this.docIds;

      this.debug(json);
      return json;
    }
  }

});

exports.DataList = DataList;
