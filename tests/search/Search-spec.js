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

  it("should be remember search queries", function() {
    var search = new Search({
      searchQuery: "nay*"
    });
    expect(search.searchQuery).toEqual("nay*");
  });

  it("should set search query via the id", function() {
    var search = new Search();

    // set from unicode
    search.id = "nay|DES";
    expect(search.id).toEqual(encodeURI("nay|DES"));
    expect(search.id).toEqual("nay%7CDES");
    expect(search._id).toEqual("nay%7CDES");

    expect(search.searchQuery).toEqual("nay|DES");
    expect(search.id).toEqual(encodeURI(search.searchQuery));

    // set from URI encoded
    search.id = "pe%CF%87%7Cleg";
    expect(search.id).toEqual(encodeURI("peχ|leg"));
    expect(search.id).toEqual("pe%CF%87%7Cleg");

    expect(search.searchQuery).toEqual("peχ|leg");
    expect(search.id).toEqual(encodeURI(search.searchQuery));
  });

  it("should be hav an id which matches searchQueries", function() {
    var search = new Search({
      searchQuery: "nay*|"
    });
    expect(search.id).toEqual(encodeURI("nay*|"));
    expect(search.id).toEqual("nay*%7C");
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

  describe("previous searches", function() {

    it("should use a datalist for results", function() {
      var search = new Search();
      search.search("aserum|");
      expect(search.searchQuery).toEqual("aserum|");
      expect(search.datalist).toBeDefined();
      expect(search.datalist.title).toEqual(search.searchQuery);
      expect(search.datalist.description).toBeDefined();
      expect(search.datalist.description).toContain("This is the result of searching for : aserum| on");
      // mock data list being set due to search.
      search.datalist.docIds = ["uiwniaejoaio-io23ijwoeisjo3", "uiwniaejoaio-io23ijwoeisj5", "uiwniaejoaio-io23ijwoeisjo6"];
      expect(search.datalist).toBeDefined();
      expect(search.datalist.id).toEqual("aserum%7C");
      expect(search.datalist.fieldDBtype).toEqual("DataList");
    });

    it("should remember previous searches datalists", function() {
      var search = new Search();
      search.search("aserum|");
      expect(search.searchQuery).toEqual("aserum|");
      // mock data list being set due to search.
      search.datalist.docIds = ["uiwniaejoaio-io23ijwoeisjo3", "uiwniaejoaio-io23ijwoeisj5", "uiwniaejoaio-io23ijwoeisjo6"];
      expect(search.datalist).toBeDefined();
      expect(search.datalist.docIds[0]).toEqual("uiwniaejoaio-io23ijwoeisjo3");
      expect(search.datalist.id).toEqual("aserum%7C");
      expect(search.datalist.id).toEqual(search.id);

      search.search("peχ|leg");
      expect(search.searchQuery).toEqual("peχ|leg");
      // mock data list being set due to search.
      search.datalist.docIds = ["aweb9023-asdjnw2", "aweb9023-asdjnw3", "aweb9023-asdjnw24"];
      expect(search.datalist).toBeDefined();
      expect(search.datalist.docIds[0]).toEqual("aweb9023-asdjnw2");
      expect(search.datalist.id).toEqual("pe%CF%87%7Cleg");
      expect(search.previousSearchDataLists["aserum%7C"]).toBeDefined();
      expect(search.previousSearchDataLists["aserum%7C"].fieldDBtype).toEqual("DataList");
      expect(search.previousSearchDataLists["aserum%7C"].docIds[0]).toEqual("uiwniaejoaio-io23ijwoeisjo3");
      expect(search.previousSearchDataListsCount).toEqual(1);


    });

  });
});
