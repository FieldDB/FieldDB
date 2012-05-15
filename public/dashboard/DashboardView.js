var DashboardView = Backbone.View.extend(
/** @lends DashboardView.prototype */
{
   /**
    * @class The main layout of the program.
    *
    * @extends Backbone.View
    * @constructs
    */
   initialize: function() {
   },
   
   el: $('#app'),
   
   events: {
   	"click": "addOneDatum"
   },
   
   /**
    * Add a datum to the screen.
    */
   addOneDatum: function() {
   	  debug("Clicked addOneDatum");
   	  
   	  var datum = new Datum({utterance: "Hello World!"});
      var view = new DatumView({model: datum});
      this.$("#content").append(view.render().el);
   }
});
