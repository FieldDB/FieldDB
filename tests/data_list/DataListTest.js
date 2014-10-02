/* globals spyOn */

var DataList = require("./../../api/data_list/DataList").DataList;
var SubExperimentDataList = require("./../../api/data_list/SubExperimentDataList").SubExperimentDataList;
var Contextualizer = require("./../../api/locales/Contextualizer").Contextualizer;
var FieldDBObject = require("./../../api/FieldDBObject").FieldDBObject;

var specIsRunningTooLong = 5000;
var SAMPLE_DATALIST_MODEL = require("../../api/data_list/datalist.json");

describe("Data List", function() {
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
    });


    it("should warn devs datumIds are deprecated", function() {
      var list = new DataList({
        title: "An old data list",
        description: "Testing upgrade of old datalists from backbone to commonjs.",
        datumIds: ["123o4j", "1231qwaeisod", "23ea"]
      });
      expect(list.title).toBe("An old data list");
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
      expect(list.docs.type).toEqual("DocumentCollection");
      expect(list.docs.docone.id).toEqual("docone");
      expect(list.docs.length).toEqual(3);
      expect(list.docIds).toEqual(["docone", "doctwo", "docthree"]);
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
      expect(listToSave.docIds).toEqual(["docone", "doctwo", "docthree"]);
      expect(listToSave.datumIds).toEqual(["docone", "doctwo", "docthree"]);
      expect(listToSave.docs).toBeUndefined();
    });

    it("should serialize existing datalists without breaking prototype app", function() {
      // SAMPLE_DATALIST_MODEL.debugMode = true;
      var list = new DataList(SAMPLE_DATALIST_MODEL);
      expect(list.comments).toBeDefined();
      expect(list.comments.collection[0].text).toContain("an example of how you can");

      var listToSave = list.toJSON();
      expect(listToSave._id).toEqual(list.id);
      expect(listToSave.title).toEqual(list.title);
      expect(listToSave.description).toEqual(list.description);
      expect(listToSave.dbname).toEqual(list.dbname);
      expect(listToSave.datumIds).toEqual(list.datumIds);
      expect(listToSave.pouchname).toEqual(list.pouchname);
      expect(listToSave.dateCreated).toEqual(list.dateCreated);
      expect(listToSave.dateModified).toEqual(list.dateModified);
      expect(listToSave.comments).toBeDefined();
      expect(listToSave.comments[0].text).toContain("an example of how you can");
      expect(listToSave.comments[0].type).toEqual("Comment");
      expect(listToSave.comments[0].text).toEqual(list.comments.collection[0].text);
      expect(listToSave.comments[0].username).toEqual(list.comments.collection[0].username);
      expect(listToSave.comments[0].gravatar).toEqual(list.comments.collection[0].gravatar);
      expect(listToSave.comments[0].timestamp).toEqual(1348670525349);
    });

    it("should serialize datalists with docs into docIds without breaking the docids", function() {
      var list = new DataList(SAMPLE_DATALIST_MODEL);
      list.datumIds = [];
      // list.debugMode = true;
      expect(list.datumIds).toEqual([]);
      list.populate([{
        _id: "5EB57D1E-5D97-428E-A9C7-377DEEC02A14"
      }, {
        _id: "F60C2FE6-20FB-4B2B-BB3A-448B0784DBE5"
      }, {
        _id: "D43A71E0-EFE3-4BC4-AABA-FDD152890326"
      }, {
        _id: "B31DB3E0-1F43-4FE0-9299-D1C85F0C4C62"
      }, {
        _id: "AF976245-1157-47DE-8B6A-28A7542D3497"
      }, {
        _id: "23489BDF-68EF-46C9-BB06-4C8EC9D77F48"
      }, {
        _id: "944C2CDE-74B8-4322-8940-72E8DD134841"
      }, {
        _id: "ED5A2292-659E-4B27-A352-9DBC5065207E"
      }, {
        _id: "924726BF-FAE7-4472-BD99-A13FCB5FEEFF"
      }]);

      expect(list.docs.length).toEqual(9);
      expect(list.docIds).toEqual(SAMPLE_DATALIST_MODEL.datumIds);
      expect(list.docs["924726BF-FAE7-4472-BD99-A13FCB5FEEFF"]._id).toEqual("924726BF-FAE7-4472-BD99-A13FCB5FEEFF");
      expect(list.docs["924726BF_FAE7_4472_BD99_A13FCB5FEEFF"]).toBeUndefined();
      // expect(list.docs["924726BF_FAE7_4472_BD99_A13FCB5FEEFF"]._id).toEqual("924726BF-FAE7-4472-BD99-A13FCB5FEEFF");

      var listToSave = list.toJSON();
      expect(listToSave.datumIds).toEqual(SAMPLE_DATALIST_MODEL.datumIds);

    });

  });

  describe("actions on items", function() {

    it("should show filtered results of user's corpus (search)", function() {
      expect(true).toBeTruthy();
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
      var list = new DataList({
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
      // list.debugMode = true;
      list.getAllAudioAndVideoFiles().then(function(urls) {
        expect(urls).toEqual(["http://youtube.com/iwoamoiemqo32", "http://soundcloud.com/iwoa/moiemqo32", "http://localhost:3184/example/oiemqo32"]);
        // expect(dl.playDatum()).toBeTruthy();
      }).done(done);
    }, specIsRunningTooLong);

    it("should copy datum to clipboard", function() {
      expect(true).toBeTruthy();
      //  expect(dl.copyDatum()).toContain("");
    });

    it("should star datum", function() {
      var dl = new DataList({
        docs: [new FieldDBObject({
          "_id": "docOne",
          "datumFields": [],
          "session": {},
          "star": function(value) {
            this._star = value;
          }
        }), new FieldDBObject({
          "_id": "doctwo",
          "datumFields": [],
          "session": {},
          "star": function(value) {
            this._star = value;
          }
        }), new FieldDBObject({
          "_id": "docthree",
          "datumFields": [],
          "session": {},
          "star": function(value) {
            this._star = value;
          }
        })]
      });

      expect(dl.applyFunctionToAllIds).toBeDefined();

      spyOn(dl.docs.doctwo, "star");
      expect(dl.docs.docOne.id).toEqual("docOne");
      dl.applyFunctionToAllIds(["doctwo", "docOne"], "star", ["on"]);
      expect(dl.docs.doctwo.star).toHaveBeenCalledWith("on");

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
      expect(dl.title.type).toEqual("ContextualizableObject");
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
      expect(dl.contextualizer.type).toEqual("Contextualizer");
      expect(dl.description.type).toEqual("ContextualizableObject");
      expect(dl.description.for_experimentAdministrator).toEqual("This is a screening test for reading difficulties before children learn to read.");

    });

    it("should serialize results", function() {
      var experiment = new SubExperimentDataList({
        trials: ["idoftrialafromdatabase", "idoftrialbfromdatabase"]
      });
      expect(experiment.trials).toBeDefined();
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
      expect(experiment.trials.length).toEqual(2);
      expect(experiment.trials.idoftrialafromdatabase.responses[0].x).toEqual(200);

      var toSave = experiment.toJSON();
      expect(toSave.trials).toEqual(["idoftrialafromdatabase", "idoftrialbfromdatabase"]);
      expect(toSave.results[0].responses[0].x).toEqual(200);

    });

  });
});
