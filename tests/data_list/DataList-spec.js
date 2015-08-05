/* globals spyOn , FieldDB */

var DataList;
var Datum;
var SubExperimentDataList;
var ExperimentDataList;
var Contextualizer;
var ContextualizableObject;
var FieldDBObject;
try {
  if (FieldDB) {
    DataList = FieldDB.DataList;
    Datum = FieldDB.Datum;
    SubExperimentDataList = FieldDB.SubExperimentDataList;
    ExperimentDataList = FieldDB.ExperimentDataList;
    Contextualizer = FieldDB.Contextualizer;
    ContextualizableObject = FieldDB.ContextualizableObject;
    FieldDBObject = FieldDB.FieldDBObject;
  }
} catch (e) {}

DataList = DataList || require("./../../api/data_list/DataList").DataList;
Datum = Datum || require("./../../api/datum/Datum").Datum;
SubExperimentDataList = SubExperimentDataList || require("./../../api/data_list/SubExperimentDataList").SubExperimentDataList;
ExperimentDataList = ExperimentDataList || require("./../../api/data_list/ExperimentDataList").ExperimentDataList;
Contextualizer = Contextualizer || require("./../../api/locales/Contextualizer").Contextualizer;
ContextualizableObject = ContextualizableObject || require("./../../api/locales/ContextualizableObject").ContextualizableObject;
FieldDBObject = FieldDBObject || require("./../../api/FieldDBObject").FieldDBObject;

var mockDatabase = require("./../corpus/DatabaseMock").mockDatabase;
var specIsRunningTooLong = 5000;
var SAMPLE_DATALIST_MODEL = require("../../sample_data/datalist_v1.22.1.json")[0];

describe("Data List", function() {


  afterEach(function() {
    if (FieldDBObject.application) {
      console.log("Cleaning up.");
      FieldDBObject.application = null;
    }
    mockDatabase = {
      get: mockDatabase.get,
      set: mockDatabase.set,
      fetchCollection: mockDatabase.fetchCollection
    };
    ContextualizableObject.compatibleWithSimpleStrings = true;
  });


  beforeEach(function() {
    if (FieldDBObject.application) {
      // console.log("Cleaning up.");
      FieldDBObject.application = null;
    }
    mockDatabase = {
      get: mockDatabase.get,
      set: mockDatabase.set,
      fetchCollection: mockDatabase.fetchCollection
    };
    ContextualizableObject.compatibleWithSimpleStrings = true;
  });

  describe("construction", function() {

    it("should load the DataList", function() {
      expect(DataList).toBeDefined();
    });

    it("should show a title, dateCreated, description, and datumIDs of the Datums in the Data List by default", function() {
      var list = new DataList();
      expect(list).toBeDefined();
      expect(list.title).toBe("");
      expect(list.description).toBe("");
      expect(list.docIds).toEqual([]);
      expect(list.length).toEqual(0);
    });

    it("should warn devs datumIds are deprecated", function() {
      var list = new DataList({
        title: "An old data list",
        description: "Testing upgrade of old datalists from backbone to commonjs.",
        datumIds: ["123o4j",
          "1231qwaeisod",
          "23ea"
        ]
      });
      expect(list.title).toEqual("An old data list");
      expect(list.warnMessage).toContain("datumIds is deprecated, please use docIds instead.");
    });

    it("should accept a docs collection", function() {
      var list = new DataList({
        docs: [
          new FieldDBObject({
            "_id": "docone",
            "datumFields": [],
            "session": {}
          }), new FieldDBObject({
            "_id": "doctwo",
            "datumFields": [],
            "session": {}
          }), new FieldDBObject({
            "_id": "docthree",
            "datumFields": [],
            "session": {}
          })
        ]
      });
      expect(list.docs.fieldDBtype).toEqual("DocumentCollection");
      expect(list.docs.docone.id).toEqual("docone");
      expect(list.docs.length).toEqual(3);
      expect(list.docIds).toEqual(["docone",
        "doctwo",
        "docthree"
      ]);
      expect(list.length).toEqual(3);
    });


    it("should support custom primary keys", function() {
      var datalist = new DataList({
        docs: {
          primaryKey: "tempId"
        },
        docIds: ["one"],
      });
      expect(datalist.docs.primaryKey).toEqual("tempId");
      expect(datalist.docIds).toEqual(["one"]);
      expect(datalist.docs.one.tempId).toEqual("one");
    });

    it("should be able to empty docs", function() {
      expect(SAMPLE_DATALIST_MODEL.datumIds.length).toEqual(9);

      var list = new DataList(JSON.parse(JSON.stringify(SAMPLE_DATALIST_MODEL)));
      list.docs = [];
      // list.debugMode = true;
      expect(list.docs.length).toEqual(0);
      expect(list.docIds.length).toEqual(0);

      list.populate([{
        _id: "5EB57DXE-5D97-428E-A9C7-377DEEC02A19"
      }, {
        _id: "F60C2FX6-20FB-4B2B-BB3A-448B0784DBE9"
      }, ]);

      expect(list.docs.length).toEqual(2);
      expect(list.docIds.length).toEqual(2);
      expect(list.datumIds.length).toEqual(2);
      expect(list.docs["5EB57DXE-5D97-428E-A9C7-377DEEC02A19"]._id).toEqual("5EB57DXE-5D97-428E-A9C7-377DEEC02A19");
    });

  });

  describe("reindexing", function() {

    it("should be able to update to the current list on the server", function(done) {
      FieldDBObject.application = {
        _corpus: {
          fetchCollection: mockDatabase.fetchCollection,
          dbname: "jekins-testingcorpus"
        }
      };
      var autoGeneratedDataList = new DataList({
        api: "comments",
        dbname: "jenkins-testingcorpus",
        // debugMode: true
      });

      expect(autoGeneratedDataList).toBeDefined();
      expect(autoGeneratedDataList.title).toEqual("");
      expect(autoGeneratedDataList.docs).toBeUndefined();

      autoGeneratedDataList.reindexFromApi().then(function(result) {
        expect(result).toBe(autoGeneratedDataList);

        expect(autoGeneratedDataList.warnMessage).toBeDefined();
        expect(autoGeneratedDataList.warnMessage).toContain("Downloaded the auto-genrated data list of datum ordered by creation date in this data list");

        expect(autoGeneratedDataList.docs).toBeDefined();
        expect(autoGeneratedDataList.docs.length).toEqual(4);
        expect(autoGeneratedDataList.docs._collection[2].id).toEqual("kweo");
        expect(autoGeneratedDataList.docs._collection[2].loaded).toEqual(false);

      }, function(error) {
        expect(error).toBeFalsy();
      }).done(done);

    }, specIsRunningTooLong);

  });

  describe("adding and removing docs", function() {

    it("should add docs to a datalist which had docIds ", function() {
      expect(SAMPLE_DATALIST_MODEL.datumIds.length).toEqual(9);

      var list = new DataList(JSON.parse(JSON.stringify(SAMPLE_DATALIST_MODEL)));
      expect(list.docIds).toEqual(SAMPLE_DATALIST_MODEL.datumIds);
      expect(list.datumIds.length).toEqual(9);
      expect(list.docs["924726BF-FAE7-4472-BD99-A13FCB5FEEFF"]._id).toEqual("924726BF-FAE7-4472-BD99-A13FCB5FEEFF");

      // expect(list.docs.INTERNAL_MODELS.item.toString()).toEqual();
      var additions = list.add([{
        _id: "5EB57DXE-5D97-428E-A9C7-377DEEC02A10"
      }, {
        _id: "F60C2FX6-20FB-4B2B-BB3A-448B0784DBE0"
      }, ]);

      expect(list.docs.length).toEqual(11);
      expect(list.docIds.length).toEqual(11);
      expect(list.docIds).toEqual(SAMPLE_DATALIST_MODEL.datumIds.concat(["5EB57DXE-5D97-428E-A9C7-377DEEC02A10", "F60C2FX6-20FB-4B2B-BB3A-448B0784DBE0"]));
      expect(list.datumIds.length).toEqual(11);

      expect(list.docs["5EB57DXE-5D97-428E-A9C7-377DEEC02A10"]._id).toEqual("5EB57DXE-5D97-428E-A9C7-377DEEC02A10");

      expect(additions).toBeDefined();
      expect(additions.length).toEqual(2);
      expect(additions[0]).toBe(list.docs._collection[list.docs.length - 2]);
      expect(additions[1]).toBe(list.docs._collection[list.docs.length - 1]);

      additions = list.unshift({
        id: "anotheritem",
        _rev: "2-9023",
        withrReal: "contents"
      });
      expect(list.docIds.length).toEqual(12);
      expect(list.docs.anotheritem.toJSON()).toEqual({
        fieldDBtype: "FieldDBObject",
        id: "anotheritem",
        _rev: "2-9023",
        withrReal: "contents",
        version: list.version
      });
      expect(list.docs.indexOf("anotheritem")).toEqual(0);

      expect(additions).toBeDefined();
      expect(additions).toBe(list.docs._collection[0]);

      var bottomItem = list.pop();
      expect(bottomItem.id).toEqual("F60C2FX6-20FB-4B2B-BB3A-448B0784DBE0");
      if (bottomItem.fieldDBtype === "FieldDBObject") {
        expect(bottomItem.fieldDBtype).toEqual("FieldDBObject");
      } else {
        expect(bottomItem.fieldDBtype).toEqual("LanguageDatum");
      }

      bottomItem = list.pop();
      expect(bottomItem.id).toEqual("5EB57DXE-5D97-428E-A9C7-377DEEC02A10");
      expect(bottomItem.fieldDBtype).toBeDefined();

      bottomItem = list.pop();
      expect(bottomItem.id).toEqual("924726BF-FAE7-4472-BD99-A13FCB5FEEFF");
      expect(bottomItem.fieldDBtype).toBeDefined();

      additions = list.unshift({
        id: "yetanotheritem",
        _rev: "3-9023"
      });
      expect(list.docIds.length).toEqual(10);
      expect(list.docs.yetanotheritem.toJSON()).toEqual({
        fieldDBtype: "FieldDBObject",
        id: "yetanotheritem",
        _rev: "3-9023",
        version: list.version
      });
      expect(list.docs.indexOf("anotheritem")).toEqual(1);
      expect(list.docs.indexOf("yetanotheritem")).toEqual(0);

      expect(additions).toBeDefined();
      expect(additions).toBe(list.docs._collection[0]);
      expect(list.docs.get(0)).toBe(additions);

      expect(list.docIds).toEqual(["yetanotheritem",
        "anotheritem",
        "5EB57D1E-5D97-428E-A9C7-377DEEC02A14",
        "F60C2FE6-20FB-4B2B-BB3A-448B0784DBE5",
        "D43A71E0-EFE3-4BC4-AABA-FDD152890326",
        "B31DB3E0-1F43-4FE0-9299-D1C85F0C4C62",
        "AF976245-1157-47DE-8B6A-28A7542D3497",
        "23489BDF-68EF-46C9-BB06-4C8EC9D77F48",
        "944C2CDE-74B8-4322-8940-72E8DD134841",
        "ED5A2292-659E-4B27-A352-9DBC5065207E"
      ]);
    });

    it("should add fast if the docs are not declared", function() {
      var startTimeAddWithExistingMembers = Date.now();
      var datalist1 = new DataList({
        docIds: ["one"]
      });
      var addition1 = datalist1.add({
        id: "two"
      }, {
        id: "three"
      }, {
        id: "four"
      }, {
        id: "five"
      }, {
        id: "six"
      });
      expect(addition1).toBeDefined();

      var slowerAddTime = Date.now() - startTimeAddWithExistingMembers;
      // expect(slowerAddTime).toEqual(1);

      var startTimeAddWithNoExistingMembers = Date.now();
      var datalist2 = new DataList();
      var addition2 = datalist2.add({
        id: "two"
      }, {
        id: "three"
      }, {
        id: "four"
      }, {
        id: "five"
      }, {
        id: "six"
      });
      expect(addition2).toBeDefined();

      var fasterAddTime = Date.now() - startTimeAddWithNoExistingMembers;
      // expect(fasterAddTime).toEqual(1);

      console.log(fasterAddTime + " should be less than " + slowerAddTime + " because it doesnt have to search for an item, but we arent requreing it");
      // expect(fasterAddTime <= slowerAddTime).toBeTruthy();
      // expect(slowerAddTime >= fasterAddTime).toBeTruthy();
    });

    it("should add fast if the docs are not declared, but keep other customization", function() {
      var datalist = new DataList({
        docs: {
          primaryKey: "tempId"
        },
        docIds: ["tempone"]
      });
      expect(datalist.docs.primaryKey).toEqual("tempId");
      expect(datalist.docIds).toEqual(["tempone"]);
      expect(datalist.docs.tempone.tempId).toEqual("tempone");

      // datalist.docs.debugMode = true;
      var additions = datalist.add([{
        tempId: "temptwo",
        some: "content"
      }, {
        tempId: "tempthree",
        num: 1
      }, {
        tempId: "tempfour",
        some: "other content"
      }]);
      expect(additions).toBeDefined();

      expect(datalist.docs.primaryKey).toEqual("tempId");
      expect(datalist.docIds).toEqual(["tempone", "temptwo", "tempthree", "tempfour"]);
      expect(datalist.docs.tempone.tempId).toEqual("tempone");

      expect(datalist.docs.temptwo).toBeDefined();
      expect(datalist.docs.temptwo.tempId).toEqual("temptwo");
      expect(datalist.docs.temptwo.some).toEqual("content");

      expect(datalist.docs.tempthree.tempId).toEqual("tempthree");
      expect(datalist.docs.tempthree.num).toEqual(1);

    });
  });

  describe("merging", function() {
    it("should add fast if the docs are not declared, but keep other customization", function() {
      var datalist = new DataList({
        docs: {
          primaryKey: "tempId"
        },
        docIds: ["tempone"]
      });

      var additions = datalist.add([{
        tempId: "temptwo",
        some: "content"
      }, {
        tempId: "tempthree",
        num: 1
      }, {
        tempId: "tempfour",
        _rev: "1-456",
        some: "other content"
      }]);

      expect(datalist.docs.primaryKey).toEqual("tempId");
      expect(datalist.docIds).toEqual(["tempone", "temptwo", "tempthree", "tempfour"]);

      expect(datalist.docs.tempfour.tempId).toEqual("tempfour");
      expect(datalist.docs.tempfour._rev).toEqual("1-456");
      expect(datalist.docs.tempfour.some).toEqual("other content");


      additions = datalist.add([{
        tempId: "tempthree",
        num: 1
      }, {
        tempId: "tempfour",
        _rev: "2-123",
        some: "other content changed"
      }]);

      expect(datalist.docs.tempfour.promptMessage).toBeDefined();
      expect(datalist.docs.tempfour.promptMessage).not.toContain("I found a conflict for _rev, Do you want to overwrite it from \"1-456\" -> 2-123");
      expect(datalist.docs.tempfour.promptMessage).toContain("I found a conflict for some, Do you want to overwrite it from \"other content\" -> other content changed");
      // expect(datalist.docs.tempfour.promptMessage).toContain("I found a conflict for _dateCreated, Do you want to overwrite it from ");

      // expect(datalist.docs.tempfour.toJSON()).toEqual({
      //   fieldDBtype: 'FieldDBObject',
      //   tempId: 'tempfour',
      //   some: 'other content changed',
      //   _rev: "2-123",
      //   dateCreated: datalist.docs.tempfour.dateCreated,
      //   version: datalist.version
      // });
    });
  });

  describe("pagination", function() {

    it("should create placeholder docs if set with datumids", function() {
      expect(SAMPLE_DATALIST_MODEL.datumIds.length).toEqual(9);
      expect(SAMPLE_DATALIST_MODEL.docs).toBeUndefined();
      expect(SAMPLE_DATALIST_MODEL.datumIds[7]).toEqual("ED5A2292-659E-4B27-A352-9DBC5065207E");

      var list = new DataList(JSON.parse(JSON.stringify(SAMPLE_DATALIST_MODEL)));
      expect(list.docIds.length).toEqual(9);

      expect(list.docs.length).toEqual(9);
      expect(list.docs.indexOf("ED5A2292-659E-4B27-A352-9DBC5065207E")).toEqual(7);
      expect(list.docs["ED5A2292-659E-4B27-A352-9DBC5065207E"].id).toEqual("ED5A2292-659E-4B27-A352-9DBC5065207E");
      if (list.docs["ED5A2292-659E-4B27-A352-9DBC5065207E"].fieldDBtype === "FieldDBObject") {
        expect(list.docs["ED5A2292-659E-4B27-A352-9DBC5065207E"].fieldDBtype).toEqual("FieldDBObject");
      } else {
        expect(list.docs["ED5A2292-659E-4B27-A352-9DBC5065207E"].fieldDBtype).toEqual("LanguageDatum");
      }
    });

  });

  describe("serialization", function() {

    it("should convert docs into datumIds", function() {
      var list = new DataList({
        docs: [new FieldDBObject({
          "_id": "docone",
          "datumFields": [],
          "session": {}
        }), new FieldDBObject({
          "_id": "doctwo",
          "datumFields": [],
          "session": {}
        }), new FieldDBObject({
          "_id": "docthree",
          "datumFields": [],
          "session": {}
        })]
      });
      expect(list).toBeDefined();
      var listToSave = list.toJSON();
      expect(listToSave.docIds).toEqual(["docone",
        "doctwo",
        "docthree"
      ]);
      expect(listToSave.datumIds).toEqual(["docone",
        "doctwo",
        "docthree"
      ]);
      expect(listToSave.docs).toBeUndefined();
    });

    it("should serialize existing datalists without breaking prototype app", function() {
      // JSON.parse(JSON.stringify(SAMPLE_DATALIST_MODEL)).debugMode = true;
      var list = new DataList(JSON.parse(JSON.stringify(SAMPLE_DATALIST_MODEL)));


      expect(list.title).toEqual("morphemes:nay AND gloss:des AND judgement:* AND consultants:Ricardo search result");
      expect(list.title + "").toEqual("morphemes:nay AND gloss:des AND judgement:* AND consultants:Ricardo search result");
      expect(list.title.toString()).toEqual("morphemes:nay AND gloss:des AND judgement:* AND consultants:Ricardo search result");
      expect(list.description).toEqual("This is the result of searching for : morphemes:nay AND gloss:des AND judgement:* AND consultants:Ricardo in Sample Corpus on \"2012-09-26T14:37:48.068Z\"");


      expect(list.comments).toBeDefined();
      expect(list.comments.collection[0].text).toContain("an example of how you can");
      expect(list.comments.fieldDBtype).toEqual("Comments");

      // list.comments.debugMode = true;
      if (list.comments._collection[0].fieldDBtype !== "Comment") {
        expect(list.comments._collection[0].previousFieldDBtype).toEqual("Comment");
      }

      var listToSave = list.toJSON();
      expect(listToSave._id).toEqual(list.id);

      expect(listToSave.title).toEqual("morphemes:nay AND gloss:des AND judgement:* AND consultants:Ricardo search result");
      expect(listToSave.title).toEqual("morphemes:nay AND gloss:des AND judgement:* AND consultants:Ricardo search result");
      expect(listToSave.description).toEqual("This is the result of searching for : morphemes:nay AND gloss:des AND judgement:* AND consultants:Ricardo in Sample Corpus on \"2012-09-26T14:37:48.068Z\"");

      expect(listToSave.dbname).toEqual(list.dbname);
      expect(listToSave.datumIds).toEqual(list.datumIds);
      expect(listToSave.pouchname).toEqual(list.pouchname);
      expect(listToSave.dateCreated).toEqual(list.dateCreated);
      expect(listToSave.dateModified).toEqual(list.dateModified);
      expect(listToSave.comments).toBeDefined();

      expect(listToSave.comments[0].text).toContain("an example of how you can");
      if (listToSave.comments[0].fieldDBtype === "FieldDBObject") {
        expect(listToSave.comments[0].previousFieldDBtype).toEqual("Comment");
      } else {
        expect(listToSave.comments[0].previousFieldDBtype).toBeUndefined();
        expect(listToSave.comments[0].fieldDBtype).toEqual("Comment");
      }
      expect(listToSave.comments[0].text).toEqual(list.comments.collection[0].text);
      expect(listToSave.comments[0].username).toEqual(list.comments.collection[0].username);
      expect(listToSave.comments[0].gravatar).toEqual(list.comments.collection[0].gravatar);
      expect(listToSave.comments[0].timestamp).toEqual(1348670525349);
    });

    it("should serialize datalists with docs into docIds ", function() {
      expect(SAMPLE_DATALIST_MODEL.datumIds.length).toEqual(9);

      var list = new DataList(JSON.parse(JSON.stringify(SAMPLE_DATALIST_MODEL)));
      expect(list.docIds).toEqual(SAMPLE_DATALIST_MODEL.datumIds);
      // list.debugMode = true;
      expect(list.datumIds.length).toEqual(9);
      list.add([{
        _id: "5EB57DXE-5D97-428E-A9C7-377DEEC02A10"
      }, {
        _id: "F60C2FX6-20FB-4B2B-BB3A-448B0784DBE0"
      }, ]);

      expect(list.docs.length).toEqual(11);
      expect(list.docIds.length).toEqual(11);
      expect(list.datumIds.length).toEqual(11);
      expect(list.docs["924726BF-FAE7-4472-BD99-A13FCB5FEEFF"]._id).toEqual("924726BF-FAE7-4472-BD99-A13FCB5FEEFF");
      expect(list.docs["924726BF_FAE7_4472_BD99_A13FCB5FEEFF"]).toBeUndefined();

      var listToSave = list.toJSON();
      expect(listToSave.datumIds.length).toEqual(11);
      expect(listToSave.datumIds).toEqual(SAMPLE_DATALIST_MODEL.datumIds.concat(["5EB57DXE-5D97-428E-A9C7-377DEEC02A10",
        "F60C2FX6-20FB-4B2B-BB3A-448B0784DBE0"
      ]));


    });
  });

  describe("actions on items", function() {
    var list;
    beforeEach(function() {
      list = new DataList({
        docs: [new FieldDBObject({
          "_id": "docone",
          "datumFields": [],
          "session": {},
          "audioVideo": [{
            "URL": "http://youtube.com/iwoamoiemqo32"
          }, {
            "URL": "http://soundcloud.com/iwoa/moiemqo32"
          }, {
            "URL": "http://localhost:3184/example/oiemqo32"
          }]
        }), new FieldDBObject({
          "_id": "doctwo",
          "datumFields": [],
          "session": {}
        }), new FieldDBObject({
          "_id": "docthree",
          "datumFields": [],
          "session": {},
          "audioVideo": []
        })]
      });
    });

    it("should show filtered results of users corpus (search)", function() {
      // pretend we ran search
      list.docs.collection[1].highlightedMatches = "this <span class='highlighted'>matches</span> some search <span class='highlight'>result</span>";
      list.docs.collection[2].highlightedMatches = "this <span class='highlighted'>matches</span> some other <span class='highlight'>result</span>";

      // select the itesm with matches
      var selected = list.select("highlightedMatches");
      expect(selected).toEqual(["doctwo", "docthree"]);
      expect(list.docs.docone.selected).toEqual(false);
      expect(list.docs.doctwo.selected).toEqual(true);
      expect(list.docs.docthree.selected).toEqual(true);
    });

    it("should show LaTeX'ed datum", function() {
      expect(true).toBeTruthy();
      //expect(dl.laTeXiT()).toContain("");
    });

    it("should add audio to datum", function() {
      expect(true).toBeTruthy();
      //expect(dl.addAudio()).toBeTruthy();
    });

    it("should discover audio on datum", function(done) {
      list = new DataList({
        docs: [{
          "_id": "docone",
          "datumFields": [],
          "session": {},
          "audioVideo": [{
            "URL": "http://youtube.com/iwoamoiemqo32"
          }, {
            "URL": "http://soundcloud.com/iwoa/moiemqo32"
          }, {
            "URL": "http://localhost:3184/example/oiemqo32"
          }]
        }, {
          "_id": "doctwo",
          "datumFields": [],
          "session": {}
        }, {
          "_id": "docthree",
          "datumFields": [],
          "session": {},
          "audioVideo": []
        }]
      });
      // list.debugMode = true;
      list.getAllAudioAndVideoFiles().then(function(urls) {
        expect(urls).toEqual(["http://youtube.com/iwoamoiemqo32",
          "http://soundcloud.com/iwoa/moiemqo32",
          "http://localhost:3184/example/oiemqo32"
        ]);
        // expect(dl.playDatum()).toBeTruthy();
      }).done(done);
    }, specIsRunningTooLong);

    it("should copy datum to clipboard", function() {
      expect(true).toBeTruthy();
      //  expect(dl.copyDatum()).toContain("");
    });

    it("should apply a function to certain ids", function() {
      var dl = new DataList({
        docs: [{
          "_id": "docOne",
          "datumFields": [],
          "session": {},
          "star": function(value) {
            this._star = value;
          }
        }, {
          "_id": "doctwo",
          "datumFields": [],
          "session": {},
          "star": function(value) {
            this._star = value;
          }
        }, {
          "_id": "docthree",
          "datumFields": [],
          "session": {},
          "star": function(value) {
            this._star = value;
          }
        }]
      });

      expect(dl.applyFunctionToAllIds).toBeDefined();
      expect(dl.docs.docOne.id).toEqual("docOne");
      if (dl.docs.docOne.fieldDBtype === "Datum") {
        expect(dl.docs.docOne.fieldDBtype).toEqual("Datum");
        expect(dl.docs.doctwo.fieldDBtype).toEqual("Datum");
      } else {
        expect(dl.docs.docOne.fieldDBtype).toEqual("FieldDBObject");
        expect(dl.docs.doctwo.fieldDBtype).toEqual("FieldDBObject");
      }
      expect(typeof dl.docs.docOne.save).toEqual("function");
      expect(typeof dl.docs.docOne.star).toEqual("function");

      expect(typeof dl.docs.doctwo.save).toEqual("function");
      expect(typeof dl.docs.doctwo.star).toEqual("function");

      /* cant spy on property descriptors unless they are configurable or writeable */
      spyOn(dl.docs.docOne, "star");

      // dl.docs.docOne.star("on");
      expect(dl.docs.docOne.id).toEqual("docOne");
      dl.applyFunctionToAllIds(["doctwo",
        "docOne"
      ], "star", ["on"]);

      // expect(dl.docs.docOne._star).toEqual("on");
      expect(dl.docs.docOne.star).toHaveBeenCalledWith("on");

    });
  });

  describe("psycholinguistics", function() {
    it("should permit complex title objects", function() {

      FieldDBObject.application = {};
      var dl = new SubExperimentDataList({
        // debugMode: true,
        "label": "practice",
        "title": {
          "default": "locale_practice",
          "gamified_title": "locale_gamified_practice"
        },
        "description": {
          "default": "locale_practice_description_for_teacher",
          "for_child": "locale_practice_description_for_child",
          "for_parent": "locale_practice_description_for_parent",
          "for_experimentAdministrator": "locale_practice_description_for_teacher",
          "for_school_records": "locale_practice_description_for_school_record",
          "for_experimentAdministratorSpecialist": "locale_practice_description_for_slp"
        },
        "instructions": {
          "default": "locale_practice_instructions_for_teacher",
          "for_child": "locale_practice_instructions_for_child",
          "for_parent": "locale_practice_instructions_for_parent",
          "for_experimentAdministrator": "locale_practice_instructions_for_teacher",
          "for_school_records": "locale_practice_instructions_for_school_record",
          "for_experimentAdministratorSpecialist": "locale_practice_instructions_for_slp"
        }
      });

      expect(dl).toBeDefined();
      expect(dl.title).toBeDefined();
      expect(dl.title.fieldDBtype).toEqual("ContextualizableObject");
      expect(dl.title.data).toEqual({
        default: {
          message: "locale_practice"
        },
        gamified_title: {
          message: "locale_gamified_practice"
        }
      });
      expect(dl.title.default).toEqual("locale_practice");
      expect(dl.title.gamified_title).toEqual("locale_gamified_practice");
      expect(dl.description.default).toEqual("locale_practice_description_for_teacher");
      expect(dl.instructions.default).toEqual("locale_practice_instructions_for_teacher");

      var contextualizer = new Contextualizer({
        // debugMode: true
      });
      contextualizer.addMessagesToContextualizedStrings("en", {
        "locale_practice": {
          "message": "Practice"
        },
        "locale_practice_description_for_teacher": {
          "message": "This is a screening test for reading difficulties before children learn to read."
        },
        "locale_practice_instructions_for_teacher": {
          "message": "Make sure the head phones are plugged in before you begin."
        }
      });
      FieldDBObject.application = {
        contextualizer: contextualizer
      };
      expect(contextualizer.contextualize("locale_practice_description_for_teacher")).toEqual("This is a screening test for reading difficulties before children learn to read.");
      expect(contextualizer.contextualize(dl.description.for_experimentAdministrator)).toEqual("This is a screening test for reading difficulties before children learn to read.");
      expect(dl.contextualizer.fieldDBtype).toEqual("Contextualizer");
      expect(dl.description.fieldDBtype).toEqual("ContextualizableObject");
      expect(dl.description.for_experimentAdministrator).toEqual("This is a screening test for reading difficulties before children learn to read.");

    });

    it("should serialize results", function() {
      var experiment = new SubExperimentDataList({
        trials: ["idoftrialafromdatabase",
          "idoftrialbfromdatabase"
        ]
      });
      expect(experiment.docs).toBeDefined();
      expect(experiment.docs.length).toEqual(2);

      expect(experiment.trials).toBe(experiment.docs);
      expect(experiment.trials).toBeDefined();
      expect(experiment.trials.length).toEqual(2);

      expect(experiment.docs.idoftrialafromdatabase).toBeDefined();
      expect(experiment.docs.idoftrialafromdatabase.id).toEqual("idoftrialafromdatabase");
      expect(experiment.docs.idoftrialbfromdatabase).toBeDefined();
      expect(experiment.docs.idoftrialbfromdatabase.id).toEqual("idoftrialbfromdatabase");

      expect(experiment.docs.idoftrialbfromdatabase instanceof Datum).toEqual(true);

      experiment.populate([{
        id: "idoftrialafromdatabase",
        type: "Datum",
        responses: [{
          x: 200,
          y: 200,
          score: 1
        }, {
          x: 300,
          y: 300,
          score: 0.4
        }]
      }, {
        id: "idoftrialbfromdatabase",
        type: "Datum"
      }]);
      expect(experiment.docs.length).toEqual(2);
      expect(experiment.trials.length).toEqual(2);

      expect(experiment.trials.idoftrialafromdatabase.responses[0].x).toEqual(200);

      var toSave = experiment.toJSON();
      expect(toSave.trials).toEqual(["idoftrialafromdatabase",
        "idoftrialbfromdatabase"
      ]);
      expect(toSave.results[0].responses[0].x).toEqual(200);

    });

    it("should create docs of the appropriate type for the data list so they can be fetched without losing reference", function() {
      var experiment = new ExperimentDataList({
        trials: ["practiceblock",
          "testblock"
        ]
      });

      expect(experiment).toBeDefined();
      expect(experiment.docs).toBeDefined();
      expect(experiment.docs.practiceblock).toBeDefined();
      expect(experiment.docs.testblock).toBeDefined();

      expect(experiment.docs.testblock instanceof SubExperimentDataList).toEqual(true);
      expect(experiment.docs.testblock instanceof DataList).toEqual(true);
      expect(experiment.docs.testblock instanceof FieldDBObject).toEqual(true);
      expect(experiment.docs.testblock instanceof ExperimentDataList).toEqual(false);

      expect(experiment.docs.testblock.constructor).not.toBe(FieldDBObject);
      expect(experiment.docs.testblock.constructor).not.toBe(DataList);
      expect(experiment.docs.testblock.constructor).not.toBe(ExperimentDataList);
      expect(experiment.docs.testblock.constructor).toBe(SubExperimentDataList);

    });

  });
});
