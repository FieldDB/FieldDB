/* globals window */
var Diacritics = require('diacritic');

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
        console.log(message);

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
      try {
        window.alert(message);
      } catch (e) {
        console.warn('COLLECTION BUG: ' + message);
      }
    }
  },
  warn: {
    value: function(message, message2, message3, message4) {
      console.warn('COLLECTION WARN: ' + message);
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
      console.warn('COLLECTION TODO: ' + message);
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
        /* parse internal models as a model if specified */
        if (!value[index]) {
          this.warn(index + " is undefined on this member of the collection", value);
        }
        if (this.INTERNAL_MODELS && this.INTERNAL_MODELS.item && value[index] && value[index].constructor !== this.INTERNAL_MODELS.item) {
          value[index] = new this.INTERNAL_MODELS.item(value[index]);
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
      this.debug('searchingFor', searchingFor);

      if (this[searchingFor]) {
        results.push(this[searchingFor]);
      }
      if (fuzzy) {
        searchingFor = new RegExp('.*' + searchingFor + '.*', 'i');
        sanitzedSearchingFor = new RegExp('.*' + this.sanitizeStringForPrimaryKey(searchingFor) + '.*', 'i');
        this.debug('fuzzy ', searchingFor, sanitzedSearchingFor);
      }
      if (!searchingFor || !searchingFor.test || typeof searchingFor.test !== 'function') {
        /* if not a regex, the excape it */
        if (searchingFor && searchingFor.indexOf('/') !== 0) {
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

      for (var index in this.collection) {
        if (!this.collection.hasOwnProperty(index)) {
          continue;
        }
        if (this.collection[index][optionalKeyToIdentifyItem] === searchingFor) {
          return this.collection[index] = value;
        }
      }
      if (optionalInverted) {
        this.collection.unshift(value);
      } else {
        this.collection.push(value);
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
        throw 'The primary key is undefined on this object, it cannot be added!';
      }
      var value = member[this.primaryKey];
      if (!value) {
        this.warn('This object is missing a value for the prmary key ' + this.primaryKey + '... it will be hard to find in the collection.', member);
        return;
      }
      value = this.sanitizeStringForPrimaryKey(value);
      if (value !== member[this.primaryKey]) {
        this.warn('using a modified the dot notation key of this object to be ' + value);
      }
      return value;
    }
  },

  add: {
    value: function(value) {
      var dotNotationKey = this.getSanitizedDotNotationKey(value);
      if (!dotNotationKey) {
        this.warn('The primary key is undefined on this object, it cannot be added! ', value);
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
    value: function(searchingFor, optionalKeyToIdentifyItem) {
      return this.set(searchingFor, null, optionalKeyToIdentifyItem);
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

  /**
   *  Cleans a value to become a primary key on an object (replaces punctuation and symbols with underscore)
   *  formerly: item.replace(/[-\"'+=?.*&^%,\/\[\]{}() ]/g, "")
   *
   * @param  String value the potential primary key to be cleaned
   * @return String       the value cleaned and safe as a primary key
   */
  sanitizeStringForPrimaryKey: {
    value: function(value) {
      this.debug('sanitizeStringForPrimaryKey');
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
  }


});

exports.Collection = Collection;
