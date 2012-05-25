require([
	"datum_menu/DatumMenuView", 
	"datum_menu/DatumMenu",
	"../tests/sinon"
], function(DatumMenuView,DatumMenu) {

	describe("DatumMenuView", function() {

		

		describe("Instantiation", function() {
			
			beforeEach(function() {
				this.view = new DatumMenuView();

			});

			it("should create a div element", function() {
				expect(this.view.el.nodeName).toEqual("DIV");
			});

			it("should have a class of 'datum_menu'", function() {
				//  expect($(this.view.el)).toHaveClass('datum_menu');

				expect($(this.view.el).hasClass("datum_menu")).toBeTruthy();
			});

		});

//		describe("NewDatumMenuView", function() {
//			beforeEach(function() {
//				//this.clickSpy = sinon.spy(DatumMenuView.prototype, 'starDatum');
//				this.view = new DatumMenuView({model: new DatumMenu()});
//				this.view.render();
//			});
//
//			it("should #star is clicked, it should trigger the starDatum method", function() {
//				var clickSpy = sinon.spy(this.view, 'starDatum');
//				//$("#star").click();
//				this.view.$('#star').click();
//				//$('#star', this.view.el).click();
//				expect(clickSpy).toHaveBeenCalled();
//			});
//		});

	});

});
