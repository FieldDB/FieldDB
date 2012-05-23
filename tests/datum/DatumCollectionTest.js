require([
    "datum/DatumCollection",
    "datum/Datum"
], function(DatumCollection,Datum) {
	
		describe("Test DatumCollection", function() {
			it("should print collection", function(){
				var dc = new DatumCollection();
				dc.add([{utterance: "tusunayawanmi"},{utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				//console.log(JSON.stringify(dc));
				expect(JSON.stringify(dc)).toEqual('[{"utterance":"tusunayawanmi","gloss":"dance-IMP-1OM-3SG","translation":"I feel like dancing.","grammaticalTags":"impulsative","sessionID":0,"status":{"statuses":[{"id":1,"label":"Checked"},{"id":2,"label":"To be checked","selected":true},{"id":3,"label":"Deleted"}],"active":0,"defaultStatus":0},"DatumField":{}},{"utterance":"purunaywanmi","gloss":"dance-IMP-1OM-3SG","translation":"I feel like dancing.","grammaticalTags":"impulsative","sessionID":0,"status":{"statuses":[{"id":1,"label":"Checked"},{"id":2,"label":"To be checked","selected":true},{"id":3,"label":"Deleted"}],"active":0,"defaultStatus":0},"DatumField":{}},{"utterance":"allillanchu","gloss":"dance-IMP-1OM-3SG","translation":"I feel like dancing.","grammaticalTags":"impulsative","sessionID":0,"status":{"statuses":[{"id":1,"label":"Checked"},{"id":2,"label":"To be checked","selected":true},{"id":3,"label":"Deleted"}],"active":0,"defaultStatus":0},"DatumField":{}}]');
			});
			
			it("should filter collection", function(){
				var dc = new DatumCollection();
				dc.add([{utterance: "tusunayawanmi"},{utterance: "purunaywanmi"},{utterance:"allillanchu"}]);
				var fildc = dc.where({utterance: "macaroni"});
				console.log(JSON.stringify(fildc));
				expect(fildc).toEqual([]);
			});
			
			
	});
			
});
