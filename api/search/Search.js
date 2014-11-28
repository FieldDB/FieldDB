var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

/**
 * @class Search progressively searches a corpus and updates a search/data list
 *  view as a user types keywords in the search box. Both intersection and
 *  union search is possible. It highlights search keywords in the list view.
 *
 * @property {String} searchQuery
 * @property {DataList} A list of data which fulfill the search query
 *
 * @name  Search
 * @extends FieldDBObject
 * @constructs
 */
var Search = function Search(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Search";
  }
  this.debug("Constructing Search length: ", options);
  FieldDBObject.apply(this, arguments);
};

Search.prototype = Object.create(FieldDBObject.prototype, /** @lends Search.prototype */ {
  constructor: {
    value: Search
  },

  defaults: {
    value: {
      searchQuery: ""
    }
  },

  searchKeywords: {
    get: function() {
      this.warn("searchKeywords is deprecated, use searchQuery instead.");
      return this.searchQuery;
    },
    set: function(value) {
      this.warn("searchKeywords is deprecated, use searchQuery instead.");
      this.searchQuery = value;
    }
  },

  searchQuery: {
    get: function() {
      return this._searchQuery || this.defaults.searchQuery;
    },
    set: function(value) {
      if (value === this._searchQuery) {
        return;
      }
      if (!value) {
        delete this._searchQuery;
        return;
      }
      this._searchQuery = value.trim();
    }
  }

});
exports.Search = Search;
