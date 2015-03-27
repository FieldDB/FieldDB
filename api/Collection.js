var FieldDBObject = require("./FieldDBObject").FieldDBObject;
var Q = require("q");

var regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").
  replace(/\x08/g, "\\x08");
};


/**
 * @class An array backed collection that can look up elements loosely based on id or label.
 *
 * @param {Object} options Optional json initialization object
 * @property {String} primaryKey This is the optional attribute to look in the objects when doing a get or find
 * @property {Boolean} inverted This is the optional parameter for whether the collection should be inserted from the bottom or the top of the collection

 * @extends Object
 * @tutorial tests/CollectionTest.js
 */
var Collection = function Collection(json) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Collection";
  }
  this.debug("Constructing a collection");
  if (!json) {
    json = {};
  }
  /* accepts just an array in construction */
  if (Object.prototype.toString.call(json) === "[object Array]") {
    json = {
      collection: json
    };
  }

  for (var member in json) {
    if (!json.hasOwnProperty(member) || member === "collection" /* set collection after all else has been set */ ) {
      continue;
    }
    this[member] = json[member];
  }
  if (!this.primaryKey) {
    var defaultKey = "id"; /*TODO try finding the key that exists in all objects if id doesnt exist? */
    this.debug("  Using default primary key of " + defaultKey);
    this.primaryKey = defaultKey;
  }
  if (json.collection) {
    this.collection = json.collection;
  }
  this.debug("  array of length " + this.collection.length);
  Object.apply(this, arguments);
};

/** @lends Collection.prototype */
Collection.prototype = Object.create(Object.prototype, {
  constructor: {
    value: Collection
  },

  fieldDBtype: {
    get: function() {
      return this._fieldDBtype;
    },
    set: function(value) {
      if (value !== this.fieldDBtype) {
        this.warn("Using type " + this.fieldDBtype + " when the incoming object was " + value);
      }
    }
  },

  /**
   * Can be set to true to debug all collections, or false to debug no collections and true only on the instances of objects which
   * you want to debug.
   *
   * @type {Boolean}
   */
  debugMode: {
    get: function() {
      if (this.perObjectDebugMode === undefined) {
        return false;
      } else {
        return this.perObjectDebugMode;
      }
    },
    set: function(value) {
      if (value === this.perObjectDebugMode) {
        return;
      }
      if (value === null || value === undefined) {
        delete this.perObjectDebugMode;
        return;
      }
      this.perObjectDebugMode = value;
    }
  },
  debug: {
    value: function() {
      return FieldDBObject.prototype.debug.apply(this, arguments);
    }
  },
  verboseMode: {
    get: function() {
      if (this.perObjectVerboseMode === undefined) {
        return false;
      } else {
        return this.perObjectVerboseMode;
      }
    },
    set: function(value) {
      if (value === this.perObjectVerboseMode) {
        return;
      }
      if (value === null || value === undefined) {
        delete this.perObjectVerboseMode;
        return;
      }
      this.perObjectVerboseMode = value;
    }
  },
  verbose: {
    value: function() {
      return FieldDBObject.prototype.verbose.apply(this, arguments);
    }
  },

  bug: {
    value: function() {
      return FieldDBObject.prototype.bug.apply(this, arguments);
    }
  },
  confirm: {
    value: function() {
      return FieldDBObject.prototype.confirm.apply(this, arguments);
    }
  },
  warn: {
    value: function() {
      return FieldDBObject.prototype.warn.apply(this, arguments);
    }
  },
  todo: {
    value: function() {
      return FieldDBObject.prototype.todo.apply(this, arguments);
    }
  },
  render: {
    value: function() {
      return FieldDBObject.prototype.render.apply(this, arguments);
    }
  },
  ensureSetViaAppropriateType: {
    value: function() {
      return FieldDBObject.prototype.ensureSetViaAppropriateType.apply(this, arguments);
    }
  },

  application: {
    get: function() {
      return FieldDBObject.application;
    }
  },

  collection: {
    get: function() {
      if (!this._collection) {
        this._collection = [];
      }
      return this._collection;
    },
    set: function(value) {
      if (value === this._collection) {
        return;
      }
      if (!value) {
        this._collection = [];
        return;
      }
      if (Object.prototype.toString.call(value) !== "[object Array]") {
        throw new Error("Cannot set collection to an object, only an array");
      }
      for (var itemIndex = 0; itemIndex < value.length; itemIndex++) {
        var item = value[itemIndex];
        if (!item) {
          this.warn("item" + itemIndex + "is undefined, not adding it to the collection " + this.fieldDBtype, item);
        } else {
          this.add(item);
        }
      }
      return this._collection;
    }
  },

  getKeys: {
    value: function() {
      var self = this;

      return this.collection.map(function(item) {
        return self.getSanitizedDotNotationKey(item);
      });
    }
  },

  /**
   * Loops through the collection (inefficiently, from start to end) to find
   * something which matches.
   *
   *
   * @param  {String} arg1  If run with only one argument, this is the string to look for in the primary keys.
   * @param  {String} arg2  If run with two arguments, this is the string to look for in the first argument
   * @param  {Boolean} fuzzy If run with a truthy value, will do a somewhat fuzzy search for the string anywhere in the key TODO use a real fuzzy search library if available.
   * @return {Array}       An array of found items [] if none are found TODO decide if we want to return null instead of [] when there were no results.
   */
  find: {
    value: function(arg1, arg2, fuzzy) {
      var results = [],
        searchingFor,
        optionalKeyToIdentifyItem,
        sanitzedSearchingFor;

      if (arg1 && arg2) {
        searchingFor = arg2;
        optionalKeyToIdentifyItem = arg1;
      } else if (arg1 && !arg2) {
        searchingFor = arg1;
      }

      optionalKeyToIdentifyItem = optionalKeyToIdentifyItem || this.primaryKey || "id";
      this.debug("find is searchingFor", searchingFor);
      if (!searchingFor) {
        return results;
      }

      if (Object.prototype.toString.call(searchingFor) === "[object Array]") {
        this.bug("User is using find on an array... ths is best re-coded to use search or something else.", searchingFor);
        this.todo("User is using find on an array... ths is best re-coded to use search or something else. Instead running find only on the first item in the array.");
        searchingFor = searchingFor[0];
      }

      if (typeof searchingFor === "object" && !(searchingFor instanceof RegExp)) {
        // this.debug("find is searchingFor an object", searchingFor);
        if (Object.keys(searchingFor).length === 0) {
          return results;
        }

        var key = searchingFor[this.primaryKey];
        if (!key && this.INTERNAL_MODELS && this.INTERNAL_MODELS.item && typeof this.INTERNAL_MODELS.item === "function" && !(searchingFor instanceof this.INTERNAL_MODELS.item)) {
          searchingFor = new this.INTERNAL_MODELS.item(searchingFor);
        } else if (!key && !(searchingFor instanceof FieldDBObject)) {
          searchingFor = new FieldDBObject(searchingFor);
        } else if (!key) {
          this.bug("This searchingFor is a object, and has no key. this is a problem. ", searchingFor);
        }
        key = searchingFor[this.primaryKey];
        searchingFor = key;
        // this.debug("find is searchingFor an object whose key is ", searchingFor);
      }

      if (this[searchingFor]) {
        results.push(this[searchingFor]);
      }
      if (fuzzy) {
        searchingFor = new RegExp(".*" + searchingFor + ".*", "i");
        sanitzedSearchingFor = new RegExp(".*" + this.sanitizeStringForPrimaryKey(searchingFor) + ".*", "i");
        this.debug("fuzzy ", searchingFor, sanitzedSearchingFor);
      }
      // this.debug("searching for somethign with indexOf", searchingFor);
      if (!searchingFor || !searchingFor.test || typeof searchingFor.test !== "function") {
        /* if not a regex, the excape it */
        if (searchingFor && searchingFor.indexOf && searchingFor.indexOf("/") !== 0) {
          searchingFor = regExpEscape(searchingFor);
        }
        searchingFor = new RegExp("^" + searchingFor + "$");
      }
      this.debug("searchingFor", searchingFor);
      for (var index in this.collection) {
        if (!this.collection.hasOwnProperty(index)) {
          continue;
        }
        if (searchingFor.test(this.collection[index][optionalKeyToIdentifyItem])) {
          results.push(this.collection[index]);
        } else if (fuzzy && sanitzedSearchingFor.test(this.collection[index][optionalKeyToIdentifyItem])) {
          results.push(this.collection[index]);
        }
      }

      return results;
    }
  },

  fuzzyFind: {
    value: function(searchingFor, optionalKeyToIdentifyItem) {

      return this.find(searchingFor, optionalKeyToIdentifyItem, true);
    }
  },

  set: {
    value: function(searchingFor, value, optionalKeyToIdentifyItem, optionalInverted) {
      optionalKeyToIdentifyItem = optionalKeyToIdentifyItem || this.primaryKey || "id";

      if (optionalInverted === null || optionalInverted === undefined) {
        optionalInverted = this.inverted;
      }

      if (!searchingFor && value) {
        //previously code in the add function
        value = FieldDBObject.convertDocIntoItsType(value);
        if (value && this.INTERNAL_MODELS && this.INTERNAL_MODELS.item && !(value instanceof this.INTERNAL_MODELS.item)) {
          // this.debug("adding a internamodel ", value);
          // if (!this.INTERNAL_MODELS.item.fieldDBtype || this.INTERNAL_MODELS.item.fieldDBtype !== "Document") {
          this.debug("casting an item to match the internal model which this collection requires ", this.INTERNAL_MODELS.item, value);
          if (typeof value.toJSON === "function") {
            value = value.toJSON();
          }
          value = new this.INTERNAL_MODELS.item(value);
          // } else {
          //   if (value.constructor === Object) {
          //     this.warn("this is going to be a FieldDBObject, even though its supposed to be in a collection of Documents.", value);
          //     value = new FieldDBObject(value);
          //   } else {
          //     this.warn("this is " + value[this.primaryKey] + " already some sort of an object: " + value.fieldDBtype);
          //   }
          // }
        } else {
          this.debug("  item to set was already of the right type for " + this.fieldDBtype, value);
        }
        searchingFor = this.getSanitizedDotNotationKey(value);
        if (!searchingFor) {
          this.warn("The primary key `" + this.primaryKey + "` is undefined on this object, it cannot be added! ", value);
          throw new Error("The primary key `" + this.primaryKey + "` is undefined on this object, it cannot be added! Type: " + value.fieldDBtype);
        }
        this.debug("adding " + searchingFor);

      }

      if (value && this[searchingFor] && (value === this[searchingFor] || (typeof this[searchingFor].equals === "function" && this[searchingFor].equals(value)))) {
        this.debug("Not setting " + searchingFor + ", it  was already the same in the collection");
        return this[searchingFor];
      }

      if (value === null || value === undefined) {
        this.remove(searchingFor, optionalKeyToIdentifyItem);
      }

      for (var index in this.collection) {
        if (!this.collection.hasOwnProperty(index)) {
          continue;
        }
        if (this.collection[index][optionalKeyToIdentifyItem] === searchingFor) {
          this.debug("found a match in the _collection, ", this.collection[index].equals);
          // this.collection[index].debugMode = true;
          // value.debugMode = true;
          if (this.collection[index] !== value ||
            (typeof this.collection[index].equals === "function" && !this.collection[index].equals(value))
          ) {
            if (typeof this.collection[index].merge === "function") {
              this.warn("Merging an existing _collection member " + searchingFor + " at index " + index + " (they have the same key but are not equal, nor the same object) ");
              this.collection[index].merge("self", value);
            } else {
              this.warn("Overwriting an existing _collection member " + searchingFor + " at index " + index + " (they have the same key but are not equal, nor the same object) ");
              this.warn("Overwriting ", this.collection[index], "->", value);
              this.collection[index] = value;
            }
          }
          return this.collection[index];
        }
      }
      /* if not a reserved attribute, set on object for dot notation access */
      if (["collection", "primaryKey", "find", "set", "add", "inverted", "toJSON", "length", "encrypted", "confidential", "decryptedMode"].indexOf(searchingFor) === -1) {
        this[searchingFor] = value;
        /* also provide a case insensitive cleaned version if the key can be lower cased */
        if (searchingFor && typeof searchingFor.toLowerCase === "function") {
          this[searchingFor.toLowerCase().replace(/_/g, "")] = value;
        }

      } else {
        this.warn("An item was added to the collection which has a reserved word for its key... dot notation will not work to retreive this object, but find() will work. ", value);
      }

      if (optionalInverted) {
        this.collection.unshift(value);
      } else {
        this.collection.push(value);
      }
      return this[searchingFor];
      // return value;
    }
  },

  length: {
    get: function() {
      if (this.collection) {
        return this.collection.length;
      } else {
        return 0;
      }
    }
  },

  primaryKey: {
    get: function() {
      this.debug(this.id + "  getting collection prmary key " + this._primaryKey);
      return this._primaryKey || "id";
    },
    set: function(value) {
      this.debug(this.id + "setting collection prmary key " + this._primaryKey);
      if (value) {
        this._primaryKey = value;
      }
    }
  },

  /**
   * This function should be used when trying to access a member using its id
   *
   * Originally we used this for import to create datum field labels: .replace(/[-""+=?./\[\]{}() ]/g,"")
   *
   * @param  {Object} member An object of the type of objects in this collection
   * @return {String}        The value of the primary key which is save to use as dot notation
   */
  getSanitizedDotNotationKey: {
    value: function(member) {
      if (!this.primaryKey) {
        this.warn("The primary key is undefined, nothing can be added!", this);
        throw new Error("The primary key is undefined, nothing can be added!").stack;
      }
      var value = member[this.primaryKey];
      if (!value) {
        this.warn("This object is missing a value for the primary key " + this.primaryKey + "... it will be hard to find in the collection.", member);
        return;
      }
      if (typeof value.trim === "function") {
        value = value.trim();
      }
      var oldValue = value;
      value = this.sanitizeStringForPrimaryKey(value);
      if (value !== oldValue && this.fieldDBtype !== "DatumStates") {
        this.warn("The sanitized the dot notation key of this object is not the same as its primaryKey: " + oldValue + " -> " + value);
      }
      return value;
    }
  },

  /**
   * Adds to the bottom of the collection
   *
   * @param  {Object} value a simple object, and/or  an array of objects or items of the type of this collection.
   * @return {Array}       returns a reference to the added item(s)
   */
  add: {
    value: function(value) {
      if (value && Object.prototype.toString.call(value) === "[object Array]") {
        var self = this;
        for (var itemIndex in value) {
          value[itemIndex] = self.add(value[itemIndex]);
        }
        return value;
      }

      return this.set(null, value);
    }
  },

  concat: {
    value: function(anotherCollection) {
      if (anotherCollection && anotherCollection._collection) {
        return this.add(anotherCollection._collection);
      }
      if (!anotherCollection) {
        return this;
      }
      this.add(anotherCollection);
      return this;
    }
  },

  push: {
    value: function(value) {
      // self.debug(this.collectioan);
      return this.set(null, value, null, false);
    }
  },

  unshift: {
    value: function(value) {
      return this.set(null, value, null, true);
    }
  },

  pop: {
    value: function() {
      if (!this._collection || this._collection.length < 1) {
        return;
      }
      var removed = this._collection.pop();
      if (!removed) {
        return;
      }
      var key = this.getSanitizedDotNotationKey(removed);
      if (!key) {
        this.warn("This item had no primary key, it will only be removed from the collection. ", removed);
      }

      if (this[key]) {
        this.debug("removed dot notation for ", key);
        delete this[key];
      }

      if (this[key.toLowerCase().replace(/_/g, "")]) {
        this.debug("removed dot notation for ", key.toLowerCase().replace(/_/g, ""));
        delete this[key.toLowerCase().replace(/_/g, "")];
      }
      return removed;
    }
  },

  shift: {
    value: function() {
      if (!this._collection || this._collection.length < 1) {
        return;
      }
      var removed = this._collection.shift();
      if (!removed) {
        return;
      }
      var key = this.getSanitizedDotNotationKey(removed);
      if (!key) {
        this.warn("This item had no primary key, it will only be removed from the collection. ", removed);
      }

      if (this[key]) {
        this.debug("removed dot notation for ", key);
        delete this[key];
      }

      if (this[key.toLowerCase().replace(/_/g, "")]) {
        this.debug("removed dot notation for ", key.toLowerCase().replace(/_/g, ""));
        delete this[key.toLowerCase().replace(/_/g, "")];
      }
      return removed;
    }
  },

  remove: {
    value: function(requestedRemoveFor, optionalKeyToIdentifyItem) {
      if (optionalKeyToIdentifyItem) {
        this.todo("remove optionalKeyToIdentifyItem " + optionalKeyToIdentifyItem);
      }
      var removed = [],
        itemIndex,
        key,
        searchingFor = [],
        self = this;

      if (Object.prototype.toString.call(requestedRemoveFor) !== "[object Array]") {
        requestedRemoveFor = [requestedRemoveFor];
      }
      // Look for the real item(s) in the collection
      requestedRemoveFor.map(function(requestedRemoveItem) {
        searchingFor = searchingFor.concat(self.find(requestedRemoveItem));
      });

      this.debug("requested remove of ", searchingFor);
      if (searchingFor.length === 0) {
        this.warn("Didn't remove object(s) which were not in the collection.", searchingFor);
        return removed;
      }
      /*
       * For every item, delete the dot reference to it
       */
      for (itemIndex = 0; itemIndex < searchingFor.length; itemIndex++) {
        if (!searchingFor[itemIndex] || searchingFor[itemIndex] === {}) {
          this.debug("skipping ", searchingFor[itemIndex]);
          continue;
        }
        key = this.getSanitizedDotNotationKey(searchingFor[itemIndex]);
        if (!key) {
          this.warn("This item had no primary key, it will only be removed from the collection. ", searchingFor[itemIndex]);
        }

        if (this[key]) {
          this.debug("removed dot notation for ", key);
          delete this[key];
        }

        if (this[key.toLowerCase().replace(/_/g, "")]) {
          this.debug("removed dot notation for ", key.toLowerCase().replace(/_/g, ""));
          delete this[key.toLowerCase().replace(/_/g, "")];
        }

      }

      /*
       * For every item in the collection, if it matches, remove it from the collection
       */
      for (itemIndex = this.collection.length - 1; itemIndex >= 0; itemIndex--) {
        if (searchingFor.indexOf(this.collection[itemIndex]) > -1 && removed.indexOf(this.collection[itemIndex]) === -1) {
          var thisremoved = this.collection.splice(itemIndex, 1);
          removed = removed.concat(thisremoved);
          // Find out if each removed item was requested
          for (var removedIndex = 0; removedIndex < thisremoved.length; removedIndex++) {
            if (typeof requestedRemoveFor[0] === "object" && typeof thisremoved[removedIndex].equals === "function") {
              var itMatches = false;
              for (var requestedIndex = 0; requestedIndex < requestedRemoveFor.length; requestedIndex++) {
                if (thisremoved[removedIndex].equals(requestedRemoveFor[requestedIndex])) {
                  itMatches = true;
                }
              }
              if (!itMatches) {
                this.warn("One of the requested removal items dont match what was removed ");
                this.debug("One of the requested removal items dont match what was removed ", requestedRemoveFor, "-> ", thisremoved[removedIndex]);
              }
            }
          }
        }
      }

      if (removed.length === 0) {
        this.warn("Didn't remove object(s) which were not in the collection.", searchingFor);
      }
      this.removedCollection = this.removedCollection || [];
      this.removedCollection = this.removedCollection.concat(removed);
      return removed;
    }
  },

  indexOf: {
    value: function(doc) {
      if (!this._collection || this.collection.length === 0) {
        return -1;
      }
      for (var docIndex = 0; docIndex < this._collection.length; docIndex++) {
        var key = doc[this.primaryKey];
        if (!key) {
          doc = this.find(doc);
          if (doc && doc.length > 0) {
            doc = doc[0];
          } else {
            return -1;
          }
          key = doc[this.primaryKey];
        }
        if (this._collection[docIndex][this.primaryKey] === key) {
          return docIndex;
        }

      }
      return -1;
    }
  },

  get: {
    value: function(index) {
      if (index === undefined || index === null || !this._collection) {
        return;
      }
      return this._collection[index];
    }
  },

  reorder: {
    value: function(old_index, new_index) {
      if (typeof old_index === "object") {
        old_index = this.indexOf(old_index);
      }
      if (new_index >= this._collection.length) {
        var k = new_index - this._collection.length;
        while ((k--) + 1) {
          this._collection.push(undefined);
        }
      }
      this._collection.splice(new_index, 0, this._collection.splice(old_index, 1)[0]);
    }
  },

  unsaved: {
    get: function() {
      for (var itemIndex = this._collection.length - 1; itemIndex >= 0; itemIndex--) {
        if (this._collection[itemIndex].unsaved) {
          this._unsaved = true;
          return this._unsaved;
        }
      }
      this._unsaved = false;
      return this._unsaved;
    },
    set: function(value) {
      this._unsaved = !!value;
    }
  },

  // calculateUnsaved: {
  //   value: function() {
  //     var previous = new this.constructor(this.fossil);
  //     var current = new this.constructor(this);

  //     if (previous.equals(current)) {
  //       this.warn("The " + this.fieldDBtype + "collection didnt actually change. Not marking as editied");
  //       this._unsaved = false;
  //     } else {
  //       this._unsaved = true;
  //     }
  //     return this._unsaved;
  //   }
  // },

  save: {
    value: function(optionalUserWhoSaved, saveEvenIfSeemsUnchanged, optionalUrl) {
      var deferred = Q.defer(),
        self = this,
        promises = [];

      this.saving = true;
      this.whenReady = deferred.promise;

      this.map(function(item) {
        console.log("saving ", item);
        if (item) {
          promises.push(item.save(optionalUserWhoSaved, saveEvenIfSeemsUnchanged, optionalUrl));
        } else {
          console.log("not saving this item", item);
        }
      });

      this.warn("Saving " + promises.length + " items out of a collection with  " + this.length + " items.");

      Q.allSettled(promises).done(function(results) {
        self.warn("Saved a collection", results.length);
        // self.debug(results);
        self.saving = false;
        deferred.resolve(self);
        return self;
      });

      // .then(function(results) {
      //   self.warn("Saved a collection", results.length);
      //   // self.debug(results);
      //   self.saving = false;
      //   deferred.resolve(self);
      //   return self;
      // }, function(results) {
      //   self.warn("Saved a collection,", results.length);
      //   // self.debug(results);
      //   self.saving = false;
      //   deferred.resolve(self);
      //   return self;
      // });


      return deferred.promise;
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      if (removeEmptyAttributes) {
        this.todo("removeEmptyAttributes is not implemented: " + removeEmptyAttributes);
      }
      var self = this;

      var json = this._collection.map(function(item) {
        if (typeof item.toJSON === "function") {
          self.debug("This item has a toJSON, which we will call instead");
          return item.toJSON();
        } else {
          return item;
        }
      });

      return json;
    }
  },

  /**
   * Creates a deep copy of the object (not a reference)
   * @return {Object} a near-clone of the objcet
   */
  clone: {
    value: function(includeEvenEmptyAttributes) {
      if (includeEvenEmptyAttributes) {
        this.todo("includeEvenEmptyAttributes is not implemented: " + includeEvenEmptyAttributes);
      }
      var json,
        self = this;
      try {
        json = JSON.parse(JSON.stringify(this.toJSON()));
      } catch (e) {
        console.warn(e.stack);
        this.bug("There was a problem cloning this collection", e);
      }
      json = json.map(function(item) {
        if (typeof item.clone === "function") {
          self.debug("This item has a clone, which we will call instead");
          return JSON.parse(JSON.stringify(item.clone()));
        } else {
          return item;
        }
      });

      return json;
    }
  },

  map: {
    get: function() {
      if (this._collection && typeof this._collection.map === "function") {
        var self = this;
        return function(callback) {
          return this._collection.map.apply(self._collection, [callback]);
        };
      } else {
        return undefined;
      }
    }
  },

  /**
   *  Cleans a value to be safe for a file system or the key of a hash
   *
   * @param  String value the potential primary key to be cleaned
   * @return String       the value cleaned and safe as a primary key
   */
  sanitizeStringForPrimaryKey: {
    value: function(value) {
      this.debug("sanitizeStringForPrimaryKey " + value);
      if (!value) {
        return null;
      }
      value = FieldDBObject.prototype.sanitizeStringForFileSystem.apply(this, arguments);
      if (value && value.trim) {
        value = this.camelCased(value);
      }
      return value;
    }
  },
  capitalizeFirstCharacterOfPrimaryKeys: {
    value: {
      get: function() {
        if (this._capitalizeFirstCharacterOfPrimaryKeys === undefined) {
          return false;
        }
        return this._capitalizeFirstCharacterOfPrimaryKeys;
      },
      set: function(value) {
        this._capitalizeFirstCharacterOfPrimaryKeys = value;
      }
    }
  },
  camelCased: {
    value: function(value) {
      if (!value) {
        return null;
      }
      if (value.replace) {
        value = value.replace(/_([a-zA-Z])/g, function(word) {
          return word[1].toUpperCase();
        });
        if (this.capitalizeFirstCharacterOfPrimaryKeys) {
          value = value[0].toUpperCase() + value.substring(1, value.length);
        } else {
          value = value[0].toLowerCase() + value.substring(1, value.length);
        }
      }
      return value;
    }
  },

  equals: {
    value: function(anotherCollection) {
      if (!anotherCollection) {
        return false;
      }
      if (!this._collection && !anotherCollection._collection) {
        return true;
      }

      if (!this._collection || !anotherCollection._collection) {
        return false;
      }

      if (this._collection.length !== anotherCollection._collection.length) {
        return false;
      }
      // this.debugMode = true;
      for (var itemIndex = this._collection.length - 1; itemIndex >= 0; itemIndex--) {
        var itemInThisCollection = this._collection[itemIndex];
        var itemInAnotherCollection = anotherCollection.find(itemInThisCollection[anotherCollection.primaryKey])[0];
        this.debug("Are these equal ", itemInThisCollection, itemInAnotherCollection);
        // itemInThisCollection.debugMode = true;
        if (!itemInThisCollection.equals(itemInAnotherCollection)) {
          return false;
        }
      }
      // this.debugMode = false;

      return true;
    }
  },

  merge: {
    value: function(callOnSelf, anotherCollection, optionalOverwriteOrAsk) {
      var aCollection,
        resultCollection,
        overwrite,
        localCallOnSelf,
        self = this;

      if (callOnSelf === "self") {
        this.debug("Merging into myself. ");
        aCollection = this;
      } else {
        aCollection = callOnSelf;
      }
      resultCollection = this;
      if (!optionalOverwriteOrAsk) {
        optionalOverwriteOrAsk = "";
      }

      if (!(anotherCollection instanceof aCollection.constructor)) {
        this.debug("The anotherCollection  isnt of the same type as aCollection ", aCollection.constructor, anotherCollection.constructor);
        anotherCollection = new aCollection.constructor(anotherCollection);
      } else {
        this.debug("The anotherCollection  is  the same type as aCollection ", aCollection.constructor, anotherCollection.constructor);
      }

      if (!anotherCollection || anotherCollection.length === 0) {
        this.debug("The new collection was empty, not merging.", anotherCollection);
        return resultCollection;
      }

      aCollection._collection.map(function(anItem) {
        var idToMatch = anItem[aCollection.primaryKey].toLowerCase();
        var anotherItem = anotherCollection[idToMatch];
        var resultItem = resultCollection[idToMatch];
        if (!resultItem && typeof anItem.constructor === "function") {
          self.debug("Cloning into anItem into a fielddbObjects ifits not one already");
          var json = anItem.toJSON ? anItem.toJSON() : anItem;
          resultItem = FieldDBObject.convertDocIntoItsType(json);
          var existingInCollection = resultCollection.find(resultItem);
          if (existingInCollection.length === 0) {
            self.debug("This item wasnt in the result collection yet, adding it.", resultItem);
            resultItem = resultCollection.add(resultItem);
          } else {
            resultItem = existingInCollection[0];
            self.debug("resultItem was already in the resultCollection  ", existingInCollection, resultItem);
          }
        }

        if (anItem !== aCollection[idToMatch]) {
          self.warn(" Looking at an anItem that doesnt match the aCollection's member of " + idToMatch, anItem, aCollection[idToMatch]);
        }

        if (anotherItem === undefined) {
          // no op, the new one isn't set
          self.debug(idToMatch + " was missing in new collection");
        } else if (resultItem === anotherItem || (typeof resultItem.equals === "function" && resultItem.equals(anotherItem))) {
          // no op, they are equal enough
          self.debug(idToMatch + " were equal.", anItem, anotherItem);
        } else if (!anItem || anItem === [] || anItem.length === 0 || anItem === {}) {
          self.debug(idToMatch + " was previously empty, taking the new value");
          resultCollection[idToMatch] = anotherItem;
        } else {
          //  if two arrays: concat
          if (Object.prototype.toString.call(anItem) === "[object Array]" && Object.prototype.toString.call(anotherItem) === "[object Array]") {
            self.debug(idToMatch + " was an array, concatinating with the new value", anItem, " ->", anotherItem);
            resultItem = anItem.concat(anotherItem);

            //TODO unique it?
            self.debug("  ", resultItem);
          } else {
            // if two fielddbObjects: recursively merge
            if (typeof resultItem.merge === "function") {
              if (callOnSelf === "self") {
                localCallOnSelf = callOnSelf;
              } else {
                localCallOnSelf = anItem;
              }
              self.debug("Requesting merge of internal property " + idToMatch + " using method: " + localCallOnSelf);
              var result = resultItem.merge(localCallOnSelf, anotherItem, optionalOverwriteOrAsk);
              self.debug("after internal merge ", result);
              // resultCollection[idToMatch] = resultItem;
              self.debug("after internal merge ", resultItem);

            } else {
              overwrite = optionalOverwriteOrAsk;
              if (optionalOverwriteOrAsk.indexOf("overwrite") === -1) {
                // overwrite = self.confirm("Do you want to overwrite " + idToMatch);
                self.confirm("I found a conflict for " + idToMatch + ", Do you want to overwrite it from " + JSON.stringify(anItem) + " -> " + JSON.stringify(anotherItem))
                  .then(function() {
                    self.warn("IM HERE HERE");
                    self.warn("Overwriting contents of " + idToMatch + " (this may cause disconnection in listeners)");
                    self.debug("Overwriting  ", anItem, " ->", anotherItem);
                    resultCollection[idToMatch] = anotherItem;
                  }, function() {
                    self.debug("Not Overwriting  ", anItem, " ->", anotherItem);
                    resultCollection[idToMatch] = anItem;
                  });
              } else {
                self.warn("Overwriting contents of " + idToMatch + " (this may cause disconnection in listeners)");
                self.debug("Overwriting  ", anItem, " ->", anotherItem);
                resultCollection[idToMatch] = anotherItem;
              }
            }
          }
        }
      });
      if (anotherCollection._collection && typeof anotherCollection._collection.map === "function") {

        anotherCollection._collection.map(function(anotherItem) {
          var idToMatch = anotherItem[aCollection.primaryKey];
          var anItem = aCollection[idToMatch];
          // var resultItem = resultCollection[idToMatch];

          if (anotherItem !== anotherCollection[idToMatch]) {
            self.warn(" Looking at an anItem that doesnt match the anotherCollection's member of " + idToMatch, anotherItem, anotherCollection[idToMatch]);
          }

          if (anItem === undefined) {
            self.debug(idToMatch + " was missing in target, adding it");
            var existingInCollection = resultCollection.find(anotherItem);
            if (existingInCollection.length === 0) {
              resultCollection.add(anotherItem);
            } else {
              anotherItem = existingInCollection[0];
              self.debug("anotherItem was already in the resultCollection ", existingInCollection, anotherItem);
            }

          } else if (anotherItem === undefined) {
            // no op, the new one isn't set
            self.debug(idToMatch + " was oddly undefined");
            resultCollection[idToMatch] = anItem;
          } else if (anItem === anotherItem || (typeof anItem.equals === "function" && anItem.equals(anotherItem))) {
            // no op, they are equal enough
            // self.debug(idToMatch + " were equal.", anItem, anotherItem);
            resultCollection[idToMatch] = anItem;
          } else if (!anotherItem || anotherItem === [] || anotherItem.length === 0 || anotherItem === {}) {
            self.warn(idToMatch + " was empty in the new collection, so it was replaced with an empty anItem.");
            resultCollection[idToMatch] = anotherItem;
          } else {
            // both exist and are not equal, and so have already been merged above.
            self.debug(idToMatch + " existed in both and are not equal, and so have already been merged above.");
          }
        });
      }

      return resultCollection;
    }
  },

  encrypted: {
    get: function() {
      return;
    },
    set: function(value) {
      if (this._collection) {
        if (this._collection.map === undefined) {
          this.warn("This collection isn't an array, this is odd", this);
        }
        this._collection.map(function(item) {
          item.encrypted = value;
        });
      }
    }
  },

  confidential: {
    get: function() {
      return;
    },
    set: function(value) {
      if (this._collection) {
        if (this._collection.map === undefined) {
          this.warn("This collection isn't an array, this is odd", this);
        }
        this._collection.map(function(item) {
          item.confidential = value;
        });
      }
    }
  },

  decryptedMode: {
    get: function() {
      return;
    },
    set: function(value) {
      if (this._collection) {
        if (this._collection.map === undefined) {
          this.warn("This collection isn't an array, this is odd", this);
        }
        this._collection.map(function(item) {
          item.decryptedMode = value;
        });
      }
    }
  },

  dbname: {
    get: function() {
      return;
    },
    set: function(value) {
      if (this._collection) {
        if (this._collection.map === undefined) {
          this.warn("This collection isn't an array, this is odd", this);
        }
        this._collection.map(function(item) {
          item.dbname = value;
        });
      }
    }
  },

  INTERNAL_MODELS: {
    value: {
      item: FieldDBObject
    }
  }

});

exports.Collection = Collection;
