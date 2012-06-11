//require([
//	"data_list/DataList",
//	"datum/Datum",
//  "datum/DatumLatexView",  
//  "datum/DatumsLatexView",
//  "datum_menu/DatumMenu"    
//], function(DataList, Datum, DatumLatexView, DatumsLatexView, DatumMenu) {
//		describe("Test DataList", function() {
//			it("should initialize the DataList", function() {
//				var dl = new DataList();
//				expect(dl).not.toBeNull();
//			});
//
//	        it("should show a title, dateCreated, description, and 
//              datumIDs of the Datums in the Data List by default", function() {
//       	 expect(true).toBeTruthy();
//          
//			});
//	
//			it("should show filtered results of user's corpus (search)", function(){
//			 expect(true).toBeTruthy();	
//			
//			});
//			
//			
//			it("should show LaTeX'ed datum", function(){
//				var d = new Datum();
//				var dl = new DataList();
//				dl.set("datum",d);
//				expect(dl.laTeXiT()).toContain("");
//				
//			});	
//			
//			it("should add audio to datum", function(){
//				var d = new Datum();
//				var dl = new DataList();
//				dl.set("datum",d);
//				expect(dl.addAudio()).toBeTruthy();
//			
//			});
//			
//			it("should play audio on datum", function(){
//				var d = new Datum();
//				var dl = new DataList();
//				dl.set("datum",d);
//				expect(dl.playDatum()).toBeTruthy();
//			
//			});
//			
//			it("should copy datum to clipboard", function(){
//				var d = new Datum();
//				var dl = new DataList();
//				dl.set("datum",d);
//				expect(dl.copyDatum()).toContain("");
//		
//			});
//			
//			it("should star datum", function(){
//				var fakeDatum = new Datum();
//				var dl = new DataList();
//				dl.set("datum",fakeDatum);
//				
//				//dl.starDatum = jasmine.createSpy("Say-hello spy");
//		        //expect(dl.starDatum).toHaveBeenCalled();
//				
//				
//				//expect(dl.starDatum()).toBeTruthy();
//			
//			});
//	});
//});
