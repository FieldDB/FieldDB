define("datum_menu/DatumMenuView", [
    "use!backbone", 
    "use!handlebars", 
    "datum_menu/DatumMenu",
    "text!datum_menu/datum_menu.handlebars"
], function(Backbone, Handlebars, DatumMenu, datum_menuTemplate) {
    var DatumMenuView = Backbone.View.extend(
    /** @lends DatumMenuView.prototype */
    {
        /**
         * @class The Datum Menu.
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
          //  this.el.click(_.bind( this, 'starDatum'));
          //  _.bindAll( this, 'render', 'addTask');



        },

        classname : "datum_menu",

        template: Handlebars.compile(datum_menuTemplate),
        events:{
        	"click #star": "starDatum"
        	
        },
     
        
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        
        /**
         * The starDatum function allows the user bookmark favorite data.  Adds an additional way for user's to search data without a single search term.  For instance, if the user wants to keep track of the data used in their thesis, or data that's good for their analsysis. 
         */
        starDatum: function() {
     	   console.log("I'm your favorite!!");
     	 return true;
        }
    });

    return DatumMenuView;
}); 


