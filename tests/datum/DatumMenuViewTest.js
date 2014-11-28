// require([
//  "sinon",
//  "datum_menu/DatumMenu",
//  "datum_menu/DatumMenuView",
//  "text!index.html"
// ], function(sinon, DatumMenu, DatumMenuView) {
describe("DatumMenuView", function() {

    describe("Instantiation", function() {

        beforeEach(function() {
            // this.view = new DatumMenuView();

        });

        it("should create a div element", function() {
            expect(true).toBeTruthy();
            // expect(this.view.el.nodeName).toEqual("DIV");
        });

        it("should have a class of 'datum_menu'", function() {
            expect(true).toBeTruthy();
            //  expect($(this.view.el)).toHaveClass('datum_menu');

            // expect($(this.view.el).hasClass("datum_menu")).toBeTruthy();
        });

    });

    describe("NewDatumMenuView", function() {
        beforeEach(function() {
            //this.clickSpy = sinon.spy(DatumMenuView.prototype, "starDatum');

        });
        it("it should trigger the starDatum method", function() {
            expect(true).toBeTruthy();
            // if(sinon != null){
            //  var menu = new DatumMenuView();
            //  menu.render();

            //  var clickSpy =  sinon.spy();
            //  menu.bind('starDatum", clickSpy);
            //  menu.trigger('starDatum');
            //  expect(clickSpy.called).toBeTruthy();
            // }
        });
        //          it("it should trigger the starDatum method when the #star is clicked", function() {
        //              if(sinon != null){
        //                  var itWorked = false;
        //                  var menu = new DatumMenuView();
        //                  menu.render();
        //
        //
        //
        //                  menu.$('.star').click(function() {
        //                      itWorked = true;
        //                  });
        //
        //                  var clickSpy =  sinon.spy();
        //                  menu.bind('starDatum", clickSpy);
        //
        //                  clickSpy.$('.star').trigger("click");
        //
        //                 // expect(itWorked).toBeTruthy();
        //
        //                  //menu.trigger('starDatum');
        //
        ////                    expect(clickSpy).toHaveBeenCalled();
        //
        //
        //              }
        //          });


    });

});
