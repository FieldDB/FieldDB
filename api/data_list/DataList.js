// console.log("Loading DataList.js");

var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var DocumentCollection = require("./../datum/DocumentCollection").DocumentCollection;
var Comments = require("./../comment/Comments").Comments;
var ContextualizableObject = require("./../locales/ContextualizableObject").ContextualizableObject;
var Q = require("q");

// console.log("Requireing FieldDBObject from datalist library ", FieldDBObject);

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
  if (!this._fieldDBtype) {
    this._fieldDBtype = "DataList";
  }
  this.debug("Constructing DataList ", options);
  if (options && options.comments) {
    // this.debug("DataList comments", options.comments);
    // this.debug("DataList comments", options.comments);
  }
  FieldDBObject.apply(this, arguments);
  this.debug("   Constructed datalist ", this);
};

// console.log("DataList constructor", DataList);

DataList.prototype = Object.create(FieldDBObject.prototype, /** @lends DataList.prototype */ {
  constructor: {
    value: DataList
  },

  api: {
    get: function() {
      return this._api || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("api", value);
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
        // item: FieldDBObject
    }
  },

  title: {
    get: function() {
      return this._title || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("title", value);
    }
  },

  description: {
    get: function() {
      return this._description || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("description", value);
    }
  },

  docs: {
    get: function() {
      // if (this._docs && this._docs.primaryKey !== this.primaryKey) {
      //   this._docs.primaryKey = this.primaryKey;
      // }
      return this._docs;
    },
    set: function(value) {
      this.debug("creating the " + this.id + " datalist's docs");
      var previousPrimaryKey;
      if (this._docs) {
        previousPrimaryKey = this._docs.primaryKey;
      }
      this.ensureSetViaAppropriateType("docs", value);

      if (this._docs) {
        delete this._docIds;
        if (previousPrimaryKey && previousPrimaryKey !== this._docs.primaryKey) {
          this._docs.primaryKey = previousPrimaryKey;
        }
      }
    }
  },

  add: {
    value: function(value) {
      if (value && Object.prototype.toString.call(value) === "[object Array]") {
        var self = this;
        for (var itemIndex in value) {
          value[itemIndex] = self.add(value[itemIndex]);
        }
        return value;
      }

      if (!this.docs) {
        this.debug("creating the datalist docs ", value);
        this.docs = [];
      } else {
        this.debug("adding to existing datalist docs ", value);
      }
      //Item of the datalist trumps the collections' item type
      if (this.INTERNAL_MODELS && this.INTERNAL_MODELS.item && !(value instanceof this.INTERNAL_MODELS.item)) {
        value = new this.INTERNAL_MODELS.item(value);
      } else {
        this.debug("Setting the type of this new item to Datum since it didnt have a type before, and there is no default item for this datalist.");
        value.fieldDBtype = value.fieldDBtype || "Datum";
      }
      return this.docs.add(value);
    }
  },

  addReallyComplicatedDeprecated: {
    value: function(value) {
      if (!this.docs || this.docs.length === 0) {
        if (Object.prototype.toString.call(value) === "[object Array]") {
          value = {
            collection: value,
            // primaryKey: "hithere"
          };
        } else {
          value = {
            collection: [value]
          };
        }
        value.primaryKey = this.primaryKey;
        this.debug("setting the docs  : ", value);
        this.docs = value;
        // this.docs.primaryKey = this.primaryKey;
        return this.docs._collection[0];
      }
      this.debug("adding to existing data list", value);
      return this.docs.add(value);
    }
  },

  push: {
    value: function(value) {
      if (!this.docs) {
        this.debug("creating the datalist docs ", value);
        this.docs = [];
      } else {
        this.debug("adding to existing datalist docs ", value);
      }
      return this.docs.push(value);
    }
  },

  unshift: {
    value: function(value) {
      if (!this.docs) {
        this.debug("creating the datalist docs ", value);
        this.docs = [];
      } else {
        this.debug("adding to existing datalist docs ", value);
      }
      return this.docs.unshift(value);
    }
  },

  pop: {
    value: function() {
      if (!this.docs) {
        return;
      }
      return this.docs.pop();
    }
  },

  shift: {
    value: function() {
      if (!this.docs) {
        return;
      }
      return this.docs.shift();
    }
  },

  populate: {
    value: function(results) {
      var self = this;

      if (!this.docs) {
        this.debug("creating the datalist docs to populate ", this);
        this.docs = [];
      } else {
        this.debug("populating an existing database ", this);
      }

      var guessedType;
      this.save();

      results = results.map(function(doc) {
        // prevent recursion a bit
        if (self.api !== "datalists") {
          // doc.api = self.api;
        }
        doc.confidential = self.confidential;
        // doc.url = self.url;
        doc = FieldDBObject.convertDocIntoItsType(doc);
        if (doc.fieldDBtype && doc.fieldDBtype === "Datum") {
          guessedType = "Datum";
        }
        // self.debug("adding doc", doc);
        // self.docs.add(doc); //This overwrites this doc if in the collection
        return doc;
      });
      self.todo("OVERWRITING NEW INFO INTO EXISTING DATALIST, instead save the existing list, then add them and remove the ones that arent supposed ot be there.");
      // self.docs.debugMode = true;
      self.docs = results; //This ensures that the docs list matches what the server thinks.
      // self.docs.merge("self", results); //This overwrites this doc if in the collection

      if (guessedType === "Datum") {
        self.showDocPosition = true;
        self.showDocCheckboxes = true;
        self.docsAreReorderable = true;
      }
    }
  },

  reindexFromApi: {
    value: function() {
      var self = this,
        deferred = Q.defer();

      this.whenReindexedFromApi = deferred.promise;
      if (!this.api) {
        this.debug("Not reindexing this datalist from the database, its not connected to an api.");
        Q.nextTick(function() {
          deferred.reject({
            status: 412,
            userFriendlyErrors: ["This datalist doesn't need to be re-indexed. 29834."]
          });
        });
        return deferred.promise;
      }

      if (!this.corpus || typeof this.corpus.fetchCollection !== "function") {
        self.fetching = self.loading = false;
        self.warn("This datalist has no corpus, it doesnt know how to find out which data are in it.");
        Q.nextTick(function() {
          self.docs = self.docs || [];
          deferred.reject({
            status: 412,
            userFriendlyErrors: ["This application has errored. Please notify its developers: Cannot reindex this datalist if the corpus is not specified."]
          });
        });
        return deferred.promise;
      }

      // Q.nextTick(function() {
      //   deferred.resolve(self);
      // });

      var unableToFetchCurrentDataAffiliatedWithThisDataList = function(err) {
        self.fetching = self.loading = false;
        self.warn(" problem fetching the data list");
        self.debug("err", err);
        self.docs = self.docs || [];
        deferred.reject(err);
        // return self;
      };

      this.fetching = this.loading = true;
      this.corpus.fetchCollection(this.api).then(function(generatedDatalist) {
          self.fetching = self.loading = false;
          self.warn("Downloaded the auto-genrated data list of datum ordered by creation date in this data list", generatedDatalist);
          if (!generatedDatalist) {
            self.bug("There was a problem downloading the list of data in the " + self.title + " data list. Please report this.");
            return;
          }
          generatedDatalist.docIds = generatedDatalist.docIds || generatedDatalist.datumIds;
          if (generatedDatalist.docIds && generatedDatalist.docIds.length > 0) {
            // If the data list was empty, assign the docIds which will populate it with placeholders
            if (!self.docs) {
              self.docs = [];
            }

            self.debug("Iterating through the docids to make sure they are in the list.");
            // If the data list doesn't have this id, add a placeholder
            generatedDatalist.docIds.map(function(docPrimaryKey) {
              self.debug("Looking at " + docPrimaryKey);
              if (!self._docs[docPrimaryKey]) {
                self.debug("converting " + docPrimaryKey + " into a placeholder");
                var docPlaceholder = {
                  dbname: self.dbname,
                  loaded: false
                };
                docPlaceholder[self.primaryKey] = docPrimaryKey;
                self.debug("adding " + docPrimaryKey + " into the docs");
                self.add(docPlaceholder);
              }
            });
            // If the generatedDatalist indicates this doc is (no longer) in this session, remove it?
            if (self.length !== generatedDatalist.docIds.length) {
              self.todo("Not removing items whcih the user currently has in this session which the server doesnt know about.");
            }
            delete generatedDatalist.docIds;
          }
          delete generatedDatalist.title;
          delete generatedDatalist.description;
          // self.merge("self", generatedDatalist);
          self.render();

          deferred.resolve(self);
          // return self;
        }, unableToFetchCurrentDataAffiliatedWithThisDataList)
        .fail(function(error) {
          console.error(error.stack, self);
          deferred.reject(error);
        })
        .done(function() {
          console.log("Done data list reindex if possible", self.docs.length);
        });

      return deferred.promise;
    }
  },

  length: {
    get: function() {
      if (this.docIds) {
        return this.docIds.length;
      }
      return 0;
    },
    set: function(value) {
      this.warn("data list lengths comes from the size of the datumids, it cant be set manually to " + value);
    }
  },

  primaryKey: {
    get: function() {
      if (this._docs && this._docs.primaryKey) {
        return this._docs.primaryKey;
      }
      this.warn("cant get the primary key ", this._docs);
      return "id";
    },
    set: function(value) {
      if (this.docs && this.docs.primaryKey && this.docs.primaryKey !== value) {
        this.docs.primaryKey = value;
      }
    }
  },

  docIds: {
    get: function() {
      var self = this;
      if (this.docs && this.docs.length) {
        this._docIds = [];
        this._docIds = this.docs.map(function(doc) {
          self.debug("geting doc id of this doc ", doc);
          return doc[self.primaryKey];
        });
      }
      return this._docIds || FieldDBObject.DEFAULT_ARRAY;
    },
    set: function(value) {
      if (value === this._docIds) {
        return;
      }
      if (!value || value === []) {
        // delete this._docIds;
        return;
      }
      if (typeof value.map !== "function") {
        console.error(" trying to set docIds of datalist to something that isnt an array.", value);
        throw new Error("This is a very odd set of docIds " + value);
      }
      var self = this;
      if (!this._docs || !this._docs.add || typeof this._docs.add !== "function") {
        this.docs = [];
      }
      value.map(function(docPrimaryKey) {
        self.debug("Looking at " + docPrimaryKey);
        if (self._docs && !self._docs[docPrimaryKey]) {
          self.debug("converting " + docPrimaryKey + " into a placeholder");
          var docPlaceholder = {
            dbname: self.dbname,
            loaded: false
          };
          docPlaceholder[self.primaryKey] = docPrimaryKey;
          self.debug("adding " + docPrimaryKey + " into the docs");
          self.add(docPlaceholder);
        }
      });
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
          if (!doc) {
            return;
          }
          var audioVideo = doc.audioVideo || doc._audioVideo;
          if (!audioVideo || typeof audioVideo.map !== "function") {
            return;
          }
          audioVideo.map(function(audioVideoFile) {
            if (audioVideoFile && audioVideoFile.URL) {
              audioVideoFiles.push(audioVideoFile.URL);
            }
          });
        });

        deferred.resolve(audioVideoFiles);

      });
      return deferred.promise;
    }
  },

  select: {
    value: function(attributeToTriggerSelection) {

      if (!this.docs || !this.docs.collection || typeof this.docs.collection.map !== "function") {
        return [];
      }

      var selected = [],
        self = this;

      if (attributeToTriggerSelection && attributeToTriggerSelection === "all") {
        attributeToTriggerSelection = this.primaryKey;
      }

      this.docs.collection.map(function(item) {
        if (!attributeToTriggerSelection && item.selected) {
          item.selected = true;
          selected.push(item[self.primaryKey]);
          return;
        }
        if (attributeToTriggerSelection && item[attributeToTriggerSelection]) {
          item.selected = true;
          selected.push(item[self.primaryKey]);
          return;
        }
        item.selected = false;
      });
      this.debug("Selected ", selected);
      return selected;
    }
  },

  applyFunctionToAllIds: {
    value: function(docIdsToApplyFunction, functionToApply, functionArguments) {
      if (!docIdsToApplyFunction) {
        docIdsToApplyFunction = this.docIds;
      }
      if (docIdsToApplyFunction.length === 0) {
        docIdsToApplyFunction = this.select();
      }
      if (!functionToApply) {
        functionToApply = "latexitDataList";
      }
      if (!functionArguments) {
        //        functionArguments = true; //leave it null so that the defualts will apply in the Datum call
      }

      var self = this;
      this.debug("DATA LIST docIdsToApplyFunction " + JSON.stringify(docIdsToApplyFunction));
      docIdsToApplyFunction.map(function(id) {
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
      if (this.docs && this.docs.length > 0) {
        this.docIds = null;
        this.docIds = this.docIds;
      }
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

// console.log("Exported DataList", exports);
