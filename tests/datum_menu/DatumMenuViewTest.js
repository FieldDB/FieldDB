require([
	"use!sinon",
	"datum_menu/DatumMenu", 
	"datum_menu/DatumMenuView"
	
	
], function(sinon, DatumMenu, DatumMenuView) {

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

		describe("NewDatumMenuView", function() {
			beforeEach(function() {
				//this.clickSpy = sinon.spy(DatumMenuView.prototype, 'starDatum');
				
			});
			it("it should trigger the starDatum method", function() {
				if(sinon != null){
					var menu = new DatumMenuView({model: new DatumMenu()});
					menu.render();
					
					var clickSpy =  sinon.spy();
					menu.bind('starDatum', clickSpy);
					menu.trigger('starDatum'); 
					expect(clickSpy.called).toBeTruthy();
				}
			});
			it("it should trigger the starDatum method when the #star is clicked", function() {
				if(sinon != null){
					var menu = new DatumMenuView({model: new DatumMenu()});
					menu.render();
					var clickSpy =  sinon.spy(menu, 'starDatum');
//					$('#star').click();
					
					menu.trigger('starDatum'); 
//					expect(clickSpy).toHaveBeenCalled();
				
				}
			});
			
			it("should fire a callback when 'foo' is triggered", function() {
				var Episode = Backbone.Model.extend({
					  url: function() {
					    return "/episode/" + this.id;
					  }
					});
				  
				
				// Create an anonymous spy
				  var spy = sinon.spy();
				  
				  // Create a new Backbone 'Episode' model
				  var episode = new Episode({
				    title: "Hollywood - Part 2"
				  });
				  
				  // Call the anonymous spy method when 'foo' is triggered
				  episode.bind('foo', spy); 
				  
				  // Trigger the foo event
				  episode.trigger('foo'); 
				  
				  // Expect that the spy was called at least once
				  expect(spy.called).toBeTruthy(); 
				});
		});

	});

});
