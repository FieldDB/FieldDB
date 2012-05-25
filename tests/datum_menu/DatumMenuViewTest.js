require([
    "datum_menu/DatumMenuView"
  
], function(DatumMenuView) {
	
	describe("DatumMenuView", function() {
		  
		  beforeEach(function() {
		    this.view = new DatumListView();
		  });
		  
		  describe("Instantiation", function() {
		    
		    it("should create a list element", function() {
		      expect(this.view.el.nodeName).toEqual("UL");
		    });
		    
		  });
		  
		}); 


});
