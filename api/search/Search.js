var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var DataList = require("./../data_list/DataList").DataList;

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

  INTERNAL_MODELS: {
    value: {
      datalist: DataList
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

  /**
   *  Search id is a url encoded version of the current search which means the id will change over time.
   */
  id: {
    configurable: true,
    get: function() {
      return encodeURI(this.searchQuery);
    },
    set: function(value) {
      var decoded = decodeURI(value);
      if (this.searchQuery !== value && this.searchQuery !== decoded) {
        if (value === decoded) {
          this.searchQuery = value;
        } else if (value !== decoded) {
          this.searchQuery = decoded;
        }
      }
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
      this._id = encodeURI(this._searchQuery);
    }
  },

  search: {
    configurable: true,
    writable: true,
    value: function(value) {
      if (value !== this.searchQuery) {
        this.searchQuery = value;
      }
      this.prepareDataListForSearchQuery(value);
      this.warn("Search has not been set up for this app." + value);
    }
  },

  prepareDataListForSearchQuery: {
    value: function(searchQuery) {
      if (searchQuery && this.datalist && this.datalist.id === encodeURI(searchQuery)) {
        this.warn("Search data list was already set up for " + searchQuery);
        return;
      }
      var title = "";
      if (this.corpus && this.corpus.dbname) {
        title = this.corpus.title || this.corpus.dbname;
        title = " in " + title;
      }
      this.datalist = {
        id: this.id,
        title: searchQuery,
        description: "This is the result of searching for : " + searchQuery + title + " on " + new Date()
      };
    }
  },

  datalist: {
    get: function() {
      this.debug("Getting datalist " + this.searchQuery, this._datalist);
      // if (!this._datalist || !(this._datalist instanceof DataList) || typeof this._datalist.reindexFromApi !== "function") {
      //   this.initializeDatalist();
      // }
      return this._datalist;
    },
    set: function(value) {
      if (value && value.id && this._datalist && this._datalist.id && value.id !== this._datalist.id && this._datalist.length) {
        // add to previous searches
        if (!this.previousSearchDataLists) {
          this.previousSearchDataLists = {};
          this.previousSearchDataListsCount = 0;
        }
        this.previousSearchDataLists[this._datalist.id] = this._datalist;
        this.previousSearchDataListsCount++;
      }

      this.debug("Setting datalist on search ", this._datalist, value);
      this.ensureSetViaAppropriateType("datalist", value);

      // Setting encodeURI search query as the id.
      this._datalist.id = this.id;
    }
  },

  clearPreviousSearchDataLists: {
    value: function() {
      this.warn("Releasing memory for" + this.previousSearchDataListsCount + " previousSearchDataLists ");
      delete this.previousSearchDataLists;
      delete this.previousSearchDataListsCount;
    }
  }

});
exports.Search = Search;
