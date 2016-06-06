define([
  "backbone",
  "data_list/DataList",
  "datum/Datum"
], function(
  Backbone,
  DataList,
  Datum
) {
  "use strict";

  function registerTests() {
    describe("DataList", function() {
      it("should initialize the DataList", function() {
        var dl = new DataList();
        expect(dl).not.toBeNull();
      });

      it("should show a title, dateCreated, description, and datumIDs of the Datums in the Data List by default", function() {
        expect(true).toBeTruthy();
      });

      it("should show filtered results of user's corpus (search)", function() {
        expect(true).toBeTruthy();
      });

      it("should show LaTeX'ed datum", function() {
        window.corpusfieldsforDatumParse = ["utterance", "somethingelse"];
        var dl = new DataList();
        dl.view = {
          collection: new Backbone.Collection([new Datum()])
        };

        dl.view.collection.models[0].set("fields", new Datum().parse({
          fields: [{
            id: "utterance",
            mask: "kya hai?"
          }, {
            id: "somethingelse",
            mask: "part 2 of 4"
          }, {
            id: "another",
            mask: "wont print this"
          }]
        }).fields);

        var results = dl.applyFunctionToAllIds(null, "latexitDataList");
        // console.log(results.trim().replace(/[\n\t ]/g, ""));
        expect(results.trim().replace(/[\n\t ]/g, "")).toEqual("\\section{}\\subsection{UntitledDataList}\\begin{exe}\\ex\\glllkyahai?\\\\\\\\\\\\\\glt\\emph{}\\label{kyahai}%\\begin{description}%\\item[\\sc{somethingelse}]part2of4%\\item[\\sc{another}]wontprintthis%\\end{description}\\end{exe}");
        expect(document.getElementById("export-text-area").value).toEqual(results);
      });

      xit("should play audio on datum", function() {
        var dl = new DataList();
        var results = dl.applyFunctionToAllIds(null, "playAudio");
        expect(results).toEqual(document.getElementById("export-text-area"));
      });

      it("should copy datum to clipboard", function() {
        window.corpusfieldsforDatumParse = ["utterance"];
        var dl = new DataList();
        dl.view = {
          collection: new Backbone.Collection([new Datum()])
        };

        dl.view.collection.models[0].set("fields", new Datum().parse({
          fields: [{
            id: "utterance",
            mask: "kya hai?"
          }, {
            id: "somethingelse",
            mask: "part 2 of 4"
          }]
        }).fields);

        var results = dl.applyFunctionToAllIds(null, "exportAsPlainText");
        expect(results).toEqual("kya hai?\npart 2 of 4");
        expect(document.getElementById("export-text-area").value).toEqual(results);
      });

      it("should export as csv", function() {
        window.corpusfieldsforDatumParse = ["utterance"];
        var dl = new DataList();
        dl.view = {
          collection: new Backbone.Collection([new Datum()])
        };

        dl.view.collection.models[0].set("fields", new Datum().parse({
          fields: [{
            id: "utterance",
            mask: "kya hai?"
          }, {
            id: "somethingelse",
            mask: "part 2 of 4"
          }]
        }).fields);

        var results = dl.applyFunctionToAllIds(null, "exportAsCSV");
        expect(results).toEqual("\"kya hai?\",\"part 2 of 4\"\n");
        expect(document.getElementById("export-text-area").value).toEqual(results);
      });
    });
  }

  return {
    describe: registerTests
  };
});
