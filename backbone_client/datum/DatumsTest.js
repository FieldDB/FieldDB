define(["datum/Datums"], function(Datums) {
  "use strict";

  function registerTests() {
    describe("Datums", function() {
      it("should print collection", function() {
        var data = new Datums();
        data.add([{
          utterance: "tusunayawanmi"
        }, {
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);
        // console.log(data.toJSON());
        expect(JSON.stringify(data.toJSON())).toEqual("[{\"utterance\":\"tusunayawanmi\"},{\"utterance\":\"purunaywanmi\"},{\"utterance\":\"allillanchu\"}]");
      });

      it("should filter collection", function() {
        var data = new Datums();
        data.add([{
          utterance: "tusunayawanmi"
        }, {
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);
        var fildata = data.where({
          utterance: "macaroni"
        });
        // console.log(JSON.stringify(fildata));
        expect(fildata).toEqual([]);
      });

      it("should remove a datum from collection", function() {
        var data = new Datums();
        data.add([{
          utterance: "tusunayawanmi"
        }, {
          _id: 99,
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);
        var remdata = data.remove([data.get(99)]);
        //It doesn't actually appear to remove anything....
        // console.log(JSON.stringify(remdata));
        expect(remdata.length).toEqual(1);
        expect(remdata[0].get("utterance")).toEqual("purunaywanmi");
        expect(data.length).toEqual(2);
      });

      it("should get a datum from a collection", function() {
        var data = new Datums();
        data.add([{
          _id: 99,
          utterance: "tusunayawanmi"
        }, {
          _id: 77,
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);
        var datum = data.get(77);
        //id's need to be assigned, they are not automatically generated.
        // console.log(datum);
        expect(datum.get("utterance")).toEqual("purunaywanmi");
      });

      it("should get a datum by client ID", function() {
        var data = new Datums();
        data.add([{
          _id: 99,
          utterance: "tusunayawanmi"
        }, {
          _id: 77,
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);
        var datum = data.get(77);
        //cid ARE automatically generated.
        // console.log(datum.cid);
        expect(datum.cid).toBeDefined();
        expect(datum.cid).not.toEqual(77);
      });

      it("should get a datum from a collected at an index", function() {
        var data = new Datums();
        data.add([{
          _id: 99,
          utterance: "tusunayawanmi"
        }, {
          _id: 77,
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);
        var datum = data.at(2);
        // console.log(datum);
        expect(datum.get("utterance")).toEqual("allillanchu");
      });

      it("should add a datum to the end of the collection", function() {
        var data = new Datums();
        data.add([{
          _id: 99,
          utterance: "tusunayawanmi"
        }, {
          _id: 77,
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);
        data.push({
          utterance: "qaparinayawan"
        });
        var datum = data.at(3);
        // console.log(datum);
        expect(datum.get("utterance")).toEqual("qaparinayawan");
      });

      it("should pop the last datum", function() {
        var data = new Datums();
        data.add([{
          _id: 99,
          utterance: "tusunayawanmi"
        }, {
          _id: 77,
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);
        var datum = data.pop();
        // console.log(datum);
        expect(datum.get("utterance")).toEqual("allillanchu");
      });

      it("should add a datum to the beginning of the collection", function() {
        var data = new Datums();
        data.add([{
          _id: 99,
          utterance: "tusunayawanmi"
        }, {
          _id: 77,
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);
        data.unshift({
          utterance: "qaparinayawan"
        });
        var datum = data.at(0);
        // console.log(datum);
        expect(datum.get("utterance")).toEqual("qaparinayawan");
      });

      it("should pop the first datum", function() {
        var data = new Datums();
        data.add([{
          _id: 99,
          utterance: "tusunayawanmi"
        }, {
          _id: 77,
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);
        var datum = data.shift();
        // console.log(datum);
        expect(datum.get("utterance")).toEqual("tusunayawanmi");
      });

      it("count the data in the collection", function() {
        var data = new Datums();
        data.add([{
          _id: 99,
          utterance: "tusunayawanmi"
        }, {
          _id: 77,
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);
        var datum = data.length;
        // console.log(datum);
        expect(datum).toEqual(3);
      });

      it("should pluck the data in the collection", function() {
        var data = new Datums();
        data.add([{
          _id: 99,
          utterance: "tusunayawanmi"
        }, {
          _id: 77,
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);

        var utterances = data.pluck("utterance");

        expect(JSON.stringify(utterances)).toEqual("[\"tusunayawanmi\",\"purunaywanmi\",\"allillanchu\"]");
      });

      it("should fetch the data in the collection", function(done) {
        var data = new Datums();
        data.add([{
          _id: 99,
          utterance: "tusunayawanmi"
        }, {
          _id: 77,
          utterance: "purunaywanmi"
        }, {
          utterance: "allillanchu"
        }]);

        var datum = data.create({
          _id: "abc"
        });
        expect(datum.fetch({
          success: function() {
            done();
          },
          error: function(err) {
            // console.log(err);
            expect(err).toBeDefined();
            done();
          }
        }));
      });
    });
  }

  return {
    describe: registerTests
  };
});
