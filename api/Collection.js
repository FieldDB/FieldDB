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
  console.log('Constructing a collection');

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
    console.log('  Using default primary key of ' + defaultKey);
    this.primaryKey = defaultKey;
  }
  if (json.collection) {
    this.collection = json.collection;
  }
  console.log('  array of length ' + this.collection.length);
  Object.apply(this, arguments);
};

/** @lends Collection.prototype */
Collection.prototype = Object.create(Object.prototype, {
  constructor: {
    value: Collection
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
        if (this.INTERNAL_MODELS && this.INTERNAL_MODELS.item && value[index].constructor !== this.INTERNAL_MODELS.item) {
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
        searchingFor, optionalKeyToIdentifyItem;
      if (arg1 && arg2) {
        searchingFor = arg2;
        optionalKeyToIdentifyItem = arg1;
      } else if (arg1 && !arg2) {
        searchingFor = arg1;
      }

      optionalKeyToIdentifyItem = optionalKeyToIdentifyItem || this.primaryKey || 'id';
      // console.log('searchingFor', searchingFor);
      if (fuzzy) {
        searchingFor = new RegExp('.*' + searchingFor + '.*', 'i');
        console.log('fuzzy ', searchingFor);
      }
      if (!searchingFor.test || typeof searchingFor.test !== 'function') {
        /* if not a regex, the excape it */
        if (searchingFor.indexOf('/') !== 0) {
          searchingFor = regExpEscape(searchingFor);
        }
        searchingFor = new RegExp('^' + searchingFor + '$');
      }
      console.log('searchingFor', searchingFor);
      for (var index in this.collection) {
        if (!this.collection.hasOwnProperty(index)) {
          continue;
        }
        if (searchingFor.test(this.collection[index][optionalKeyToIdentifyItem])) {
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
      /* if not a reserved attribute, set on objcet for dot notation access */
      if (['collection', 'primaryKey', 'find', 'set', 'add', 'inverted', 'toJSON', 'length'].indexOf(searchingFor) === -1) {
        this[searchingFor] = value;
        /* also provide a case insensitive cleaned version */
        this[searchingFor.toLowerCase().replace(/_/g, '')] = value;
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
        console.warn('This object is missing a value for the prmary key ' + this.primaryKey + '... it will be hard to find in the collection.', member);
        return;
      }
      if (value.trim) {
        value = value.trim().replace(/[^a-zA-Z0-9]+/g, '_');
      }
      if (value !== member[this.primaryKey]) {
        console.warn('using a modified the dot notation key of this object to be ' + value);
      }
      return value;
    }
  },

  add: {
    value: function(value) {
      var dotNotationKey = this.getSanitizedDotNotationKey(value);
      if (!dotNotationKey) {
        throw 'The primary key is undefined on this object, it cannot be added!';
      }
      console.log('adding ' + dotNotationKey);
      this.set(dotNotationKey, value);
    }
  },

  push: {
    value: function(value) {
      // console.log(this.collection);
      this.set(this.getSanitizedDotNotationKey(value), value, null, false);
      // console.log(this.collection);
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
      var json = this._collection.map(function(item) {
        if (this.INTERNAL_MODELS && this.INTERNAL_MODELS.item && typeof this.INTERNAL_MODELS.item === "function" && new this.INTERNAL_MODELS.item().toJSON === "function") {
          console.log("This item has a toJSON, which we will call instead");
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
      var json = JSON.parse(JSON.stringify(this.toJSON()));

      return json;
    }
  }

});

exports.Collection = Collection;
