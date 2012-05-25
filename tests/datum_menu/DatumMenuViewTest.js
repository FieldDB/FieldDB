require([
    "datum_menu/DatumMenuView"
  
], function(DatumMenuView) {
	
	describe("DatumMenuView", function() {
		  
		  beforeEach(function() {
		    this.view = new DatumMenuView();
		  });
		  
		  describe("Instantiation", function() {
			  
			  it("should create a div element", function() {
			      expect(this.view.el.nodeName).toEqual("DIV");
			    });
		    
			  it("should have a class of 'datum_menu'", function() {
				//  expect($(this.view.el)).toHaveClass('datum_menu');

				  expect($(this.view.el).hasClass("datum_menu")).toBeTruthy();
				});
		    
		  });
		  
//		  beforeEach(function() {
//			  this.datumMenuView = new Backbone.View();
//			  this.datumMenuRenderSpy = sinon.spy(this.datumMenuView, "render");
//			});
//
//		  it("should render each DatumMenu view", function() {
//			  expect(this.datumMenuView.render).toHaveBeenCalledThrice();
//			});
		  
		  describe("NewDatumView", function(){
			  beforeEach( function(){    
			    this.view = new DatumMenuView();
			    this.view.render();
			  });

			  it("should #star is clicked, it should trigger the starDatum method", function(){
			    var clickSpy = sinon.spy( this.view, 'starDatum');
			    $("#star").click();
			    expect( clickSpy ).toHaveBeenCalled();
			  });
			});
		  
		  
		  
		  
		  
		  
		  
		  
		}); 
	
});
