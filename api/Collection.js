/* globals window */
var Diacritics = require('diacritic');
var FieldDBObject = require("./FieldDBObject").FieldDBObject;

var regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
  replace(/\x08/g, '\\x08');
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
  this.debug('Constructing a collection');
  if (!json) {
    json = {};
  }
  /* accepts just an array in construction */
  if (Object.prototype.toString.call(json) === '[object Array]') {
    json = {
      collection: json
    };
  }

  for (var member in json) {
    if (!json.hasOwnProperty(member) || member === 'collection' /* set collection after all else has been set */ ) {
      continue;
    }
    this[member] = json[member];
  }
  if (!this.primaryKey) {
    var defaultKey = 'id'; /*TODO try finding the key that exists in all objects if id doesnt exist? */
    this.debug('  Using default primary key of ' + defaultKey);
    this.primaryKey = defaultKey;
  }
  if (json.collection) {
    this.collection = json.collection;
  }
  this.debug('  array of length ' + this.collection.length);
  Object.apply(this, arguments);
};

/** @lends Collection.prototype */
Collection.prototype = Object.create(Object.prototype, {
  constructor: {
    value: Collection
  },

  type: {
    get: function() {
      var funcNameRegex = /function (.{1,})\(/;
      var results = (funcNameRegex).exec((this).constructor.toString());
      return (results && results.length > 1) ? results[1] : "";
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
    value: function(message, message2, message3, message4) {
      try {
        if (window.navigator && window.navigator.appName === 'Microsoft Internet Explorer') {
          return;
        }
      } catch (e) {
        //do nothing, we are in node or some non-friendly browser.
      }
      if (this.debugMode) {
        console.log(this.type.toUpperCase() + ' DEBUG:' + message);

        if (message2) {
          console.log(message2);
        }
        if (message3) {
          console.log(message3);
        }
        if (message4) {
          console.log(message4);
        }
      }
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
    value: function(message, message2, message3, message4) {
      if (this.verboseMode) {
        this.debug(message, message2, message3, message4);
      }
    }
  },

  bug: {
    value: function(message) {
      if (this.bugMessage) {
        this.bugMessage += ";;; ";
      } else {
        this.bugMessage = "";
      }
      this.bugMessage = this.bugMessage + message;
      try {
        window.alert(message);
      } catch (e) {
        console.warn(this.type.toUpperCase() + ' BUG: ' + message);
      }
    }
  },
  confirm: {
    value: function(message) {
      if (this.confirmMessage) {
        this.confirmMessage += "\n";
      } else {
        this.confirmMessage = "";
      }
      this.confirmMessage = this.confirmMessage + message;
      try {
        return window.confirm(message);
      } catch (e) {
        console.warn(this.type.toUpperCase() + ' ASKING USER: ' + message + ' pretending they said no.');
        return false;
      }
    }
  },
  warn: {
    value: function(message, message2, message3, message4) {
      if (this.warnMessage) {
        this.warnMessage += ";;; ";
      } else {
        this.warnMessage = "";
      }
      this.warnMessage = this.warnMessage + message;
      console.warn(this.type.toUpperCase() + ' WARN: ' + message);
      if (message2) {
        console.warn(message2);
      }
      if (message3) {
        console.warn(message3);
      }
      if (message4) {
        console.warn(message4);
      }
    }
  },
  todo: {
    value: function(message, message2, message3, message4) {
      console.warn(this.type.toUpperCase() + ' TODO: ' + message);
      if (message2) {
        console.warn(message2);
      }
      if (message3) {
        console.warn(message3);
      }
      if (message4) {
        console.warn(message4);
      }
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
        value = [];
      }
      for (var index in value) {
        if (!value.hasOwnProperty(index)) {
          continue;
        }
        /* parse internal models as a model if specified */
        if (!value[index]) {
          this.warn(index + " is undefined on this member of the collection", value);
        }
        this.add(value[index]);
      }
      return this._collection;
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

      optionalKeyToIdentifyItem = optionalKeyToIdentifyItem || this.primaryKey || 'id';
      this.debug('find is searchingFor', searchingFor);
      if (!searchingFor) {
        return results;
      }

      if (Object.prototype.toString.call(searchingFor) === '[object Array]') {
        this.bug("User is using find on an array... ths is best re-coded to use search or something else.", searchingFor);
        this.todo("User is using find on an array... ths is best re-coded to use search or something else. Instead running find only on the first item in the array.");
        searchingFor = searchingFor[0];
      }

      if (typeof searchingFor === "object" && !(searchingFor instanceof RegExp)) {
        // this.debug('find is searchingFor an object', searchingFor);
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
        // this.debug('find is searchingFor an object whose key is ', searchingFor);
      }

      if (this[searchingFor]) {
        results.push(this[searchingFor]);
      }
      if (fuzzy) {
        searchingFor = new RegExp('.*' + searchingFor + '.*', 'i');
        sanitzedSearchingFor = new RegExp('.*' + this.sanitizeStringForPrimaryKey(searchingFor) + '.*', 'i');
        this.debug('fuzzy ', searchingFor, sanitzedSearchingFor);
      }
      // this.debug("searching for somethign with indexOf", searchingFor);
      if (!searchingFor || !searchingFor.test || typeof searchingFor.test !== 'function') {
        /* if not a regex, the excape it */
        if (searchingFor && searchingFor.indexOf && searchingFor.indexOf('/') !== 0) {
          searchingFor = regExpEscape(searchingFor);
        }
        searchingFor = new RegExp('^' + searchingFor + '$');
      }
      this.debug('searchingFor', searchingFor);
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
      optionalKeyToIdentifyItem = optionalKeyToIdentifyItem || this.primaryKey || 'id';

      if (optionalInverted === null || optionalInverted === undefined) {
        optionalInverted = this.inverted;
      }

      if (value && this[searchingFor] && (value === this[searchingFor] || (typeof this[searchingFor].equals === "function" && this[searchingFor].equals(value)))) {
        this.warn("Not setting " + searchingFor + ", it already the same in the collection");
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
          this.warn("Overwriting an existing value");
          this.collection[index] = value;
          return value;
        }
      }
      /* if not a reserved attribute, set on object for dot notation access */
      if (['collection', 'primaryKey', 'find', 'set', 'add', 'inverted', 'toJSON', 'length', 'encrypted', 'confidential', 'decryptedMode'].indexOf(searchingFor) === -1) {
        this[searchingFor] = value;
        /* also provide a case insensitive cleaned version if the key can be lower cased */
        if (typeof searchingFor.toLowerCase === 'function') {
          this[searchingFor.toLowerCase().replace(/_/g, '')] = value;
        }

      } else {
        console.warn('An item was added to the collection which has a reserved word for its key... dot notation will not work to retreive this object, but find() will work. ', value);
      }

      if (optionalInverted) {
        this.collection.unshift(value);
      } else {
        this.collection.push(value);
      }
      return value;
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

  /**
   * This function should be used when trying to access a member using its id
   *
   * Originally we used this for import to create datum field labels: .replace(/[-"'+=?./\[\]{}() ]/g,"")
   *
   * @param  {Object} member An object of the type of objects in this collection
   * @return {String}        The value of the primary key which is save to use as dot notation
   */
  getSanitizedDotNotationKey: {
    value: function(member) {
      if (!this.primaryKey) {
        this.warn('The primary key is undefined, nothing can be added!', this);
        throw 'The primary key is undefined, nothing can be added!';
      }
      var value = member[this.primaryKey];
      if (!value) {
        this.warn('This object is missing a value for the prmary key ' + this.primaryKey + '... it will be hard to find in the collection.', member);
        return;
      }
      var oldValue = value;
      value = this.sanitizeStringForPrimaryKey(value);
      if (value !== member[this.primaryKey]) {
        this.warn('The sanitized the dot notation key of this object is not the same as its primaryKey: ' + oldValue + " -> " + value);
      }
      return value;
    }
  },

  add: {
    value: function(value) {
      if (this.INTERNAL_MODELS && this.INTERNAL_MODELS.item && value && value.constructor !== this.INTERNAL_MODELS.item) {
        value = new this.INTERNAL_MODELS.item(value);
        this.debug("casting an item to match the internal model", value)
      }
      var dotNotationKey = this.getSanitizedDotNotationKey(value);
      if (!dotNotationKey) {
        this.warn('The primary key ' + this.primaryKey + ' is undefined on this object, it cannot be added! ', value);
        throw 'The primary key is undefined on this object, it cannot be added! ' + value;
      }
      this.debug('adding ' + dotNotationKey);
      this.set(dotNotationKey, value);
    }
  },

  push: {
    value: function(value) {
      // self.debug(this.collection);
      this.set(this.getSanitizedDotNotationKey(value), value, null, false);
      // self.debug(this.collection);
    }
  },

  unshift: {
    value: function(value) {
      this.set(this.getSanitizedDotNotationKey(value), value, null, true);
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

      if (Object.prototype.toString.call(requestedRemoveFor) !== '[object Array]') {
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

        if (this[key.toLowerCase().replace(/_/g, '')]) {
          this.debug("removed dot notation for ", key.toLowerCase().replace(/_/g, ''));
          delete this[key.toLowerCase().replace(/_/g, '')];
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
                this.warn("One of the requested removal items dont match what was removed ", requestedRemoveFor, "-> ", thisremoved[removedIndex]);
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

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      if (removeEmptyAttributes) {
        this.todo('removeEmptyAttributes is not implemented: ' + removeEmptyAttributes);
      }
      var json = this._collection.map(function(item) {
        if (this.INTERNAL_MODELS && this.INTERNAL_MODELS.item && typeof this.INTERNAL_MODELS.item === "function" && new this.INTERNAL_MODELS.item().toJSON === "function") {
          this.debug("This item has a toJSON, which we will call instead");
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
        this.todo('includeEvenEmptyAttributes is not implemented: ' + includeEvenEmptyAttributes);
      }
      var json = JSON.parse(JSON.stringify(this.toJSON()));

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
   *  Cleans a value to become a primary key on an object (replaces punctuation and symbols with underscore)
   *  formerly: item.replace(/[-\"'+=?.*&^%,\/\[\]{}() ]/g, "")
   *
   * @param  String value the potential primary key to be cleaned
   * @return String       the value cleaned and safe as a primary key
   */
  sanitizeStringForPrimaryKey: {
    value: function(value) {
      this.debug('sanitizeStringForPrimaryKey ' + value);
      if (!value) {
        return null;
      }
      if (value.trim) {
        value = Diacritics.clean(value);
        value = value.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_/, '').replace(/_$/, '');
        return this.camelCased(value);
      } else if (typeof value === 'number') {
        return parseInt(value, 10);
      } else {
        return null;
      }
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

      if (!anotherCollection || anotherCollection.length === 0) {
        this.debug("The new collection was empty, not merging.", anotherCollection);
        return resultCollection;
      }

      aCollection._collection.map(function(anItem) {
        var idToMatch = anItem[aCollection.primaryKey].toLowerCase();
        var anotherItem = anotherCollection[idToMatch];
        var resultItem = resultCollection[idToMatch];
        if (!resultItem && typeof anItem.constructor === "function") {
          var json = anItem.toJSON ? anItem.toJSON() : anItem;
          resultItem = new anItem.constructor(json);
          var existingInCollection = resultCollection.find(resultItem);
          if (existingInCollection.length === 0) {
            resultCollection.add(resultItem);
          } else {
            resultItem = existingInCollection[0];
            self.debug("resultItem was already in the resultCollection  ", existingInCollection, resultItem);
          }
        }

        if (anItem !== aCollection[idToMatch]) {
          self.bug(" Looking at an anItem that doesnt match the aCollection's member of " + idToMatch);
        }

        if (anotherItem === undefined) {
          // no op, the new one isn't set
          self.debug(idToMatch + " was missing in new collection");
          resultCollection[idToMatch] = anItem;

        } else if (anItem === anotherItem) {
          // no op, they are equal enough
          self.debug(idToMatch + " were equal.", anItem, anotherItem);
          if (resultItem !== anItem) {
            resultCollection[idToMatch] = anItem;
          }
        } else if (!anItem || anItem === [] || anItem.length === 0 || anItem === {}) {
          self.debug(idToMatch + " was previously empty, taking the new value");
          resultCollection[idToMatch] = anotherItem;
        } else {
          //  if two arrays: concat
          if (Object.prototype.toString.call(anItem) === '[object Array]' && Object.prototype.toString.call(anotherItem) === '[object Array]') {
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
                overwrite = self.confirm("I found a conflict for " + idToMatch + ", Do you want to overwrite it from " + JSON.stringify(anItem) + " -> " + JSON.stringify(anotherItem));
              }
              if (overwrite) {
                self.warn("Overwriting contents of " + idToMatch + " (this may cause disconnection in listeners)", anItem, " ->", anotherItem);
                resultCollection[idToMatch] = anotherItem;
              } else {
                resultCollection[idToMatch] = anItem;

              }
            }
          }
        }
      });
      anotherCollection._collection.map(function(anotherItem) {
        var idToMatch = anotherItem[aCollection.primaryKey];
        var anItem = aCollection[idToMatch];
        // var resultItem = resultCollection[idToMatch];

        if (anotherItem !== anotherCollection[idToMatch]) {
          self.bug(" Looking at an anItem that doesnt match the anotherCollection's member of " + idToMatch);
        }

        if (anItem === undefined) {
          self.debug(idToMatch + " was missing in target, adding it");
          var existingInCollection = resultCollection.find(anotherItem);
          if (existingInCollection.length === 0) {
            resultCollection.add(anotherItem);
          } else {
            resultItem = existingInCollection[0];
            self.debug("anotherItem was already in the resultCollection ", existingInCollection, anotherItem);
          }

        } else if (anotherItem === undefined) {
          // no op, the new one isn't set
          self.debug(idToMatch + " was oddly undefined");
          resultCollection[idToMatch] = anItem;
        } else if (anItem === anotherItem) {
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
  }



});

exports.Collection = Collection;
