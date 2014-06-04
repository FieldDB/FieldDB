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
  if (Object.prototype.toString.call(json) === '[object Array]') {
    this.collection = json;
  } else {
    for (var member in json) {
      if (!json.hasOwnProperty(member)) {
        continue;
      }
      this[member] = json[member];
    }
  }
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
      for (var item in value) {
        this.set(value[item][this.primaryKey], value[item]);
      }
      return this._collection;
    }
  },

  find: {
    value: function(arg1, arg2, fuzzy) {
      var results = [],
        searchingFor, optionalKeyToIdentifyItem;
      if (arg1 && arg2) {
        searchingFor = arg2;
        optionalKeyToIdentifyItem = arg1;
      } else if (arg1 && !arg2) {
        searchingFor = arg1
      }

      optionalKeyToIdentifyItem = optionalKeyToIdentifyItem || this.primaryKey || '_id';
      // console.log('searchingFor', searchingFor);
      if (fuzzy) {
        searchingFor = new RegExp('.*' + searchingFor + '.*', 'i');
        console.log('fuzzy ', searchingFor);
      }
      if (!searchingFor.test || typeof searchingFor.test !== 'function') {
        searchingFor = new RegExp('^' + searchingFor + '$');
      }
      // console.log('searchingFor', searchingFor);
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
      optionalKeyToIdentifyItem = optionalKeyToIdentifyItem || this.primaryKey || '_id';

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

  add: {
    value: function(value) {
      this.set(value[this.primaryKey], value);
    }
  },

  push: {
    value: function(value) {
      console.log(this.collection);
      this.set(value[this.primaryKey], value, null, false);
      console.log(this.collection);
    }
  },

  unshift: {
    value: function(value) {
      this.set(value[this.primaryKey], value, null, true);
    }
  },

  remove: {
    value: function(searchingFor, optionalKeyToIdentifyItem) {
      return this.set(searchingFor, null, optionalKeyToIdentifyItem);
    }
  },

  toJSON: {
    value: function() {
      return this._collection;
    }
  }
});

exports.Collection = Collection;
