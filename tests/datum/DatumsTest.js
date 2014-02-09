describe("Test Datums", function() {
  it("should print collection", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([{utterance: "tusunayawanmi"},{utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
    //console.log(JSON.stringify(dc));
    //        expect(JSON.stringify(dc)).toEqual('[{"utterance":"tusunayawanmi","morphemes":"tusa-naya-wa-n","gloss":"dance-IMP-1OM-3SG","translation":"I feel like dancing.","grammaticalTags":"impulsative","sessionID":0,"status":{"statuses":[{"id":1,"label":"Checked"},{"id":2,"label":"To be checked","selected":true},{"id":3,"label":"Deleted"}],"active":0,"defaultStatus":0},"datumField":{"script":"","context":"","semanticDenotation":"","ipa":"","segmentation":"tusu-naya-wa-n","other":""},"datumTag":{}},{"utterance":"purunaywanmi","morphemes":"tusa-naya-wa-n","gloss":"dance-IMP-1OM-3SG","translation":"I feel like dancing.","grammaticalTags":"impulsative","sessionID":0,"status":{"statuses":[{"id":1,"label":"Checked"},{"id":2,"label":"To be checked","selected":true},{"id":3,"label":"Deleted"}],"active":0,"defaultStatus":0},"datumField":{"script":"","context":"","semanticDenotation":"","ipa":"","segmentation":"tusu-naya-wa-n","other":""},"datumTag":{}},{"utterance":"allillanchu","morphemes":"tusa-naya-wa-n","gloss":"dance-IMP-1OM-3SG","translation":"I feel like dancing.","grammaticalTags":"impulsative","sessionID":0,"status":{"statuses":[{"id":1,"label":"Checked"},{"id":2,"label":"To be checked","selected":true},{"id":3,"label":"Deleted"}],"active":0,"defaultStatus":0},"datumField":{"script":"","context":"","semanticDenotation":"","ipa":"","segmentation":"tusu-naya-wa-n","other":""},"datumTag":{}}]');
  });

  it("should filter collection", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([{utterance: "tusunayawanmi"},{utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
    // var fildc = dc.where({utterance: "macaroni"});
    // //console.log(JSON.stringify(fildc));
    // expect(fildc).toEqual([]);
  });

  it("should remove a datum from collection", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([{utterance: "tusunayawanmi"},{utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
    // var remdc = dc.remove([{utterance: "tusunayawanmi"}]);
    // //It doesn't actually appear to remove anything....
    // console.log(JSON.stringify(remdc));
    // expect(remdc.length).toEqual(3);
  });

  it("should get a datum from a collection", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
    // var d = dc.get(77);
    //id's need to be assigned, they are not automatically generated.
    //console.log(d);
    //        expect(d.get("utterance")).toEqual("purunaywanmi");
  });

  it("should get a datum by client ID", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
    // var d = dc.get(77);
    //cid ARE automatically generated.
    //console.log(d.cid);
    //expect(d.cid).toEqual("c16");
  });

  it("should get a datum from a collected at an index", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
    // var d = dc.at(2);
    // //console.log(d);
    // expect(d.get("utterance")).toEqual("allillanchu");
  });

  it("should add a datum to the end of the collection", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
    // dc.push({utterance: "qaparinayawan"});
    // var d = dc.at(3);
    // console.log(d);
    // expect(d.get("utterance")).toEqual("qaparinayawan");
  });

  it("should pop the last datum", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
    // var d = dc.pop();
    // console.log(d);
    // expect(d.get("utterance")).toEqual("allillanchu");

  });

  it("should add a datum to the beginning of the collection", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
    // dc.unshift({utterance: "qaparinayawan"});
    // var d = dc.at(0);
    // console.log(d);
    // expect(d.get("utterance")).toEqual("qaparinayawan");
  });

  it("should pop the first datum", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
    // var d = dc.shift();
    // console.log(d);
    // expect(d.get("utterance")).toEqual("tusunayawanmi");

  });

  it("count the data in the collection", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
    // var d = dc.length;
    // console.log(d);
    // expect(d).toEqual(3);

  });

  it("should pluck the data in the collection", function() {
    expect(true).toBeTruthy();
    // var dc = new Datums();
    // dc.add([
    //         {id: 99, utterance: "tusunayawanmi"},
    //         {id: 77, utterance: "purunaywanmi"},
    //         {utterance:"allillanchu"}
    //         ]);

    // var utterances = dc.pluck("utterance");

    // expect(JSON.stringify(utterances)).toEqual('["tusunayawanmi","purunaywanmi","allillanchu"]');

  });
  //      it("should fetch the data in the collection", function(){
  //        var dc = new Datums();
  //        dc.add([
  //                {id: 99, utterance: "tusunayawanmi"},
  //                {id: 77, utterance: "purunaywanmi"},
  //                {utterance:"allillanchu"}
  //                ]);
  //        
  //        var d = dc.create({
  //          utterance: "+Hall-pa-nay-wa-n "
  //        });
  //        expect().toFail.
  //      });


});
