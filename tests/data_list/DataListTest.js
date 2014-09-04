/* globals spyOn */

var DataList = require('./../../api/data_list/DataList').DataList;
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

      expect(list.warnMessage).toEqual("datumIds is deprecated, please use docIds instead.");
    });

    it("should accept a docs collection", function() {
      var list = new DataList({
        docs: [{
          "id": "docone"
        }, {
          "id": "doctwo"
        }, {
          "id": "docthree"
        }]
      });
      expect(list.docs.type).toEqual("Collection");
      expect(list.docs.docone).toEqual({
        "id": "docone"
      });
      expect(list.docs.length).toEqual(3);
      expect(list.docIds).toEqual(['docone', 'doctwo', 'docthree']);
    });

  });

  describe("serialization", function() {

    it("should convert docs into datumIds", function() {
      var list = new DataList({
        docs: [{
          "id": "docone"
        }, {
          "id": "doctwo"
        }, {
          "id": "docthree"
        }]
      });
      expect(list).toBeDefined();
      var listToSave = list.toJSON();
      expect(listToSave.docIds).toEqual(['docone', 'doctwo', 'docthree']);
      expect(listToSave.datumIds).toEqual(['docone', 'doctwo', 'docthree']);
      expect(listToSave.docs).toBeUndefined();
    });

    it("should serialize existing datalists without breaking prototype app", function() {
      var list = new DataList(SAMPLE_DATALIST_MODEL);
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
      expect(listToSave.comments[0].type).toEqual("Comment");
      expect(listToSave.comments[0].text).toEqual(list.comments.collection[0].text);
      expect(listToSave.comments[0].username).toEqual(list.comments.collection[0].username);
      expect(listToSave.comments[0].gravatar).toEqual(list.comments.collection[0].gravatar);
      expect(listToSave.comments[0].timestamp).toEqual(1348670525349);
    });

    it("should serialize datalists with docs into docIds", function() {
      var list = new DataList(SAMPLE_DATALIST_MODEL);
      list.datumIds = [];

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
        docs: [{
          "id": "docone",
          "audioVideo": [{
            "URL": "http://youtube.com/iwoamoiemqo32"
          }, {
            "URL": "http://soundcloud.com/iwoa/moiemqo32"
          }, {
            "URL": "http://localhost:3184/example/oiemqo32"
          }]
        }, {
          "id": "doctwo"
        }, {
          "id": "docthree",
          "audioVideo": []
        }]
      });
      list.debugMode = true;
      list.getAllAudioAndVideoFiles().then(function(urls) {
        expect(urls).toEqual(['http://youtube.com/iwoamoiemqo32', 'http://soundcloud.com/iwoa/moiemqo32', 'http://localhost:3184/example/oiemqo32']);
        // expect(dl.playDatum()).toBeTruthy();
      }).done(done);
    }, specIsRunningTooLong);

    it("should copy datum to clipboard", function() {
      expect(true).toBeTruthy();
      //  expect(dl.copyDatum()).toContain("");
    });

    it("should star datum", function() {
      var dl = new DataList({
        docs: [{
          "id": "docone",
          "star": function(value) {
            this._star = value;
          }
        }, {
          "id": "doctwo",
          "star": function(value) {
            this._star = value;
          }
        }, {
          "id": "docthree",
          "star": function(value) {
            this._star = value;
          }
        }]
      });

      expect(dl.applyFunctionToAllIds).toBeDefined();

      spyOn(dl.docs.doctwo, 'star');
      dl.applyFunctionToAllIds(['doctwo', 'docone'], 'star', ['on']);
      expect(dl.docs.doctwo.star).toHaveBeenCalledWith('on');

    });
  });

  describe("psycholinguistics", function() {
    it("should permit complex title objects", function() {
      var dl = new DataList({
        "label": "practice",
        "title": {
          "default": "localized_practice",
          "gamified_title": "localized_gamified_practice"
        },
        "description": {
          "default": "localized_practice_description_for_teacher",
          "for_child": "localized_practice_description_for_child",
          "for_parent": "localized_practice_description_for_parent",
          "for_experimentAdministrator": "localized_practice_description_for_teacher",
          "for_school_records": "localized_practice_description_for_school_record",
          "for_experimentAdministratorSpecialist": "localized_practice_description_for_slp"
        },
        "instructions": {
          "default": "localized_practice_instructions_for_teacher",
          "for_child": "localized_practice_instructions_for_child",
          "for_parent": "localized_practice_instructions_for_parent",
          "for_experimentAdministrator": "localized_practice_instructions_for_teacher",
          "for_school_records": "localized_practice_instructions_for_school_record",
          "for_experimentAdministratorSpecialist": "localized_practice_instructions_for_slp"
        }
      });

      expect(dl).toBeDefined();
      expect(dl.title.default).toEqual('localized_practice');
      expect(dl.description.default).toEqual('localized_practice_description_for_teacher');
      expect(dl.instructions.default).toEqual('localized_practice_instructions_for_teacher');
    });
  });
});
