require([
    "datum_menu/DatumMenu",
    "datum/Datum",
    "data_list/DataList",
    "extra_field/ExtraField"
], function(DatumMenu,Datum,DataList,ExtraFields) {
	

		describe("Test DatumMenuGeneric", function() {
			it("should initialize the DatumMenu", function() {
				var dm = new DatumMenu();
				expect(dm).not.toBeNull();
			});
			it("should determine whether it is attached to datum", function(){
				var d = new Datum();
				var dm = new DatumMenu();
				dm.set("datum",d);
				expect(dm.isAttachedToDatum()).toBeTruthy();
			
			});
			it("should determine whether it is attached to data list", function(){
				var dl = new DataList();
				var dm = new DatumMenu();
				dm.set("dataList",dl);
				expect(dm.isAttachedToDataList()).toBeTruthy();
			
			});
			
//			it("should convert datum to LaTeX", function(){
//				var d = new Datum();
//				var dm = new DatumMenu();
//				dm.set("dataList",dl);
//				expect(dm.laTeXit()).toBeTruthy();
//			
//			});
			


	});
});
