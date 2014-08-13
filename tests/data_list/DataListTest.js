/* globals spyOn */

var DataList = require('./../../api/data_list/DataList').DataList;
var specIsRunningTooLong = 5000;

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

});
