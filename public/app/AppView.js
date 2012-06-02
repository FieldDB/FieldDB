define("app/AppView", [
	"use!backbone", 
	"datum/Datum", 
	"datum/DatumView", 
	"datum_status/DatumStatus", 
	"datum_status/DatumStatusView", 
	"navigation/Navigation", 
	"navigation/NavigationView", 
	"data_list/DataList",
	"data_list/DataListView",
	"libs/Utils"
], function(Backbone, Datum, DatumView, DatumStatus, DatumStatusView, Navigation, NavigationView, DataList, DataListView) {
	var AppView = Backbone.View.extend(
	/** @lends AppView.prototype */
	{
		/**
		 * @class The main layout of the program.
		 *
		 * @extends Backbone.View
		 * @constructs
		 */
		initialize : function() {
			Utils.debug("Clicked addOneDatum");

			// Create the new Datum to be added
			var navigation = new Navigation();

			// Render it as a NavigationView
			var view = new NavigationView({
				model : navigation
			});
			this.$("#navigation").append(view.render().el);
			
			var datalist = new DataList();
//			app.dataList.add(datalistview); we can't have this because datalist view is not a collection
//			 Render datalist view
			var d = new DataListView({

				

				model: datalist

			});
			this.$("#rightside").append(d.render().el);
			
			
		},

		el : $('#app'),

		events : {
			"click #dashboard-view" : "addOneDatum"
		},

		/**
		 * Add a datum to the screen.
		 */
		addOneDatum : function() {
			Utils.debug("Clicked addOneDatum");

			// Create the new Datum to be added
			var datum = new Datum();

			// Add it to the global list of Datum
			app.datumList.add(datum);
			app.datumList.create();

			// Render it as a DatumView
			var view = new DatumView({
				model : datum
			});
			this.$("#content").append(view.render().el);

	

			
		}
	});

	return AppView;
});
