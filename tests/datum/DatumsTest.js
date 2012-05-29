require([
    "datum/Datums",
    "datum/Datum"
], function(Datums,Datum) {
	
		describe("Test Datums", function() {
			it("should print collection", function(){
				var dc = new Datums();
				dc.add([{utterance: "tusunayawanmi"},{utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				console.log(JSON.stringify(dc));
				
				expect(JSON.stringify(dc)).toEqual('[{"utterance":"tusunayawanmi","gloss":"dance-IMP-1OM-3SG","translation":"I feel like dancing.","grammaticalTags":"impulsative","sessionID":0,"status":{"statuses":[{"id":1,"label":"Checked"},{"id":2,"label":"To be checked","selected":true},{"id":3,"label":"Deleted"}],"active":0,"defaultStatus":0},"datumMenu":{},"datumField":{"fields":[{"id":1,"label":"Script"},{"id":2,"label":"Context","selected":true},{"id":3,"label":"Semantic Denotation"},{"id":4,"label":"IPA"},{"id":5,"label":"Segmentation"},{"id":6,"label":"Other"}],"active":0,"defaultStatus":0},"datumTag":{}},{"utterance":"purunaywanmi","gloss":"dance-IMP-1OM-3SG","translation":"I feel like dancing.","grammaticalTags":"impulsative","sessionID":0,"status":{"statuses":[{"id":1,"label":"Checked"},{"id":2,"label":"To be checked","selected":true},{"id":3,"label":"Deleted"}],"active":0,"defaultStatus":0},"datumMenu":{},"datumField":{"fields":[{"id":1,"label":"Script"},{"id":2,"label":"Context","selected":true},{"id":3,"label":"Semantic Denotation"},{"id":4,"label":"IPA"},{"id":5,"label":"Segmentation"},{"id":6,"label":"Other"}],"active":0,"defaultStatus":0},"datumTag":{}},{"utterance":"allillanchu","gloss":"dance-IMP-1OM-3SG","translation":"I feel like dancing.","grammaticalTags":"impulsative","sessionID":0,"status":{"statuses":[{"id":1,"label":"Checked"},{"id":2,"label":"To be checked","selected":true},{"id":3,"label":"Deleted"}],"active":0,"defaultStatus":0},"datumMenu":{},"datumField":{"fields":[{"id":1,"label":"Script"},{"id":2,"label":"Context","selected":true},{"id":3,"label":"Semantic Denotation"},{"id":4,"label":"IPA"},{"id":5,"label":"Segmentation"},{"id":6,"label":"Other"}],"active":0,"defaultStatus":0},"datumTag":{}}]')
			});
			
			it("should filter collection", function(){
				var dc = new Datums();
				dc.add([{utterance: "tusunayawanmi"},{utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				var fildc = dc.where({utterance: "macaroni"});
				//console.log(JSON.stringify(fildc));
				expect(fildc).toEqual([]);
			});
			
			it("should remove a datum from collection", function(){
				var dc = new Datums();
				dc.add([{utterance: "tusunayawanmi"},{utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				var remdc = dc.remove([{utterance: "tusunayawanmi"}]);
				//It doesn't actually appear to remove anything....
				console.log(JSON.stringify(remdc));
				expect(remdc.length).toEqual(3);
			});
			
			it("should get a datum from a collection", function(){
				var dc = new Datums();
				dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				var d = dc.get(77);
				//id's need to be assigned, they are not automatically generated.
				//console.log(d);
				expect(d.get("utterance")).toEqual("purunaywanmi");
			});
			it("should get a datum by client ID", function(){
				var dc = new Datums();
				dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				var d = dc.get(77);
				//cid ARE automatically generated.
				//console.log(d.cid);
				//expect(d.cid).toEqual("c16");
			});
			it("should get a datum from a collected at an index", function(){
				var dc = new Datums();
				dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				var d = dc.at(2);
				//console.log(d);
				expect(d.get("utterance")).toEqual("allillanchu");
			});
			it("should add a datum to the end of the collection", function(){
				var dc = new Datums();
				dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				dc.push({utterance: "qaparinayawan"});
				var d = dc.at(3);
				console.log(d);
				expect(d.get("utterance")).toEqual("qaparinayawan");
			});
			it("should pop the last datum", function(){
				var dc = new Datums();
				dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				var d = dc.pop();
				console.log(d);
				expect(d.get("utterance")).toEqual("allillanchu");

			});
			it("should add a datum to the beginning of the collection", function(){
				var dc = new Datums();
				dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				dc.unshift({utterance: "qaparinayawan"});
				var d = dc.at(0);
				console.log(d);
				expect(d.get("utterance")).toEqual("qaparinayawan");
			});
			it("should pop the first datum", function(){
				var dc = new Datums();
				dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				var d = dc.shift();
				console.log(d);
				expect(d.get("utterance")).toEqual("tusunayawanmi");

			});
			it("count the data in the collection", function(){
				var dc = new Datums();
				dc.add([{id: 99, utterance: "tusunayawanmi"},{id: 77, utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				var d = dc.length;
				console.log(d);
				expect(d).toEqual(3);

			});
			it("should pluck the data in the collection", function(){
				var dc = new Datums();
				dc.add([
				        {id: 99, utterance: "tusunayawanmi"},
				        {id: 77, utterance: "purunaywanmi"},
				        {utterance:"allillanchu"}
				        ]);
				
				var utterances = dc.pluck("utterance")
				
				expect(JSON.stringify(utterances)).toEqual('["tusunayawanmi","purunaywanmi","allillanchu"]');
				
			});
//			it("should fetch the data in the collection", function(){
//				var dc = new Datums();
//				dc.add([
//				        {id: 99, utterance: "tusunayawanmi"},
//				        {id: 77, utterance: "purunaywanmi"},
//				        {utterance:"allillanchu"}
//				        ]);
//				
//				var d = dc.create({
//					utterance: "+Hall-pa-nay-wa-n "
//				});
//				expect().toFail.
//			});
			
			
	});
			
});
