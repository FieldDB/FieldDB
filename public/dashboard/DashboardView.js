var DashboardView = Backbone.View.extend(
/** @lends DashboardView.prototype */
{
   /**
    * @class The main layout of the program.
    *
    * @extends Backbone.Model
    * @constructs
    */
   initialize: function() {
   },
   
   el: $('#app'),
   
   events: {
   	"click .widget": "handleWidget",
   	"click": "handleClick"
   },
   
   /**
    * Output text
    */
   handleClick: function() {
      debug("Clicked outside any widget");
   },
   
   /**
    * Output text
    */
   handleWidget: function() {
      debug("Clicked a widget");
   }
});


var Dashboard = new DashboardView();
