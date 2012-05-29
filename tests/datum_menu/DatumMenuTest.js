require([
    "datum_menu/DatumMenu",
    "datum/Datum",
    "data_list/DataList",
    "datum_field/DatumField"
], function(DatumMenu,Datum,DataList,DatumField) {
		describe("Test DatumMenu", function() {
			it("should initialize the DatumMenu", function() {
				var dm = new DatumMenu();
				expect(dm).not.toBeNull();
			});
			
			it("should convert datum to LaTeX", function(){
				var d = new Datum();
				var dm = new DatumMenu();
				dm.set("datum",d);
				expect(dm.laTeXiT()).toContain("");
			
			});
			it("should add audio to datum", function(){
				var d = new Datum();
				var dm = new DatumMenu();
				dm.set("datum",d);
				expect(dm.addAudio()).toBeTruthy();
			
			});
			it("should play audio on datum", function(){
				var d = new Datum();
				var dm = new DatumMenu();
				dm.set("datum",d);
				expect(dm.playDatum()).toBeTruthy();
			
			});
			it("should copy datum to clipboard", function(){
				var d = new Datum();
				var dm = new DatumMenu();
				dm.set("datum",d);
				expect(dm.copyDatum()).toContain("");
		
			});
			it("should star datum", function(){
				var fakeDatum = new Datum();
				var dm = new DatumMenu();
				dm.set("datum",fakeDatum);
				
				//dm.starDatum = jasmine.createSpy("Say-hello spy");
		        //expect(dm.starDatum).toHaveBeenCalled();
				
				
				//expect(dm.starDatum()).toBeTruthy();
			
			});
			it("should open a new datum with fields filled just like previous datum", function(){
				var d = new Datum();
				var dm = new DatumMenu();
				dm.set("datum",d);
				//expect(dm.duplicateDatum()).toEqual(d);
				//TODO	
			});
			


	});
});
