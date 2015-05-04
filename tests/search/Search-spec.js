"use strict";
var Search;
try {
  /* globals FieldDB */
  if (FieldDB) {
    Search = FieldDB.Search;
  }
} catch (e) {}

Search = Search || require("./../../api/search/Search").Search;

describe("Search: as a user I want my data at my finger tips", function() {
  it("should be load", function() {
    expect(Search).toBeDefined();
  });

  it("should be able search", function() {
    var search = new Search({
      searchQuery: "nay*"
    });
    expect(search.searchQuery).toEqual("nay*");
  });

  it("should search for all data if query is empty", function() {
    var search = new Search();
    expect(search.searchQuery).toEqual("");
  });

  it("should be able import old searchs", function() {
    var search = new Search({
      searchKeywords: "nay*"
    });
    expect(search.searchQuery).toEqual("nay*");
    expect(search.warnMessage).toEqual("searchKeywords is deprecated, use searchQuery instead.");
  });

});
