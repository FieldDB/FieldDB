define("app/AppView", [
	"use!backbone", 
	"datum/Datum", 
	"datum/DatumView", 
	"datum_status/DatumStatus", 
	"datum_status/DatumStatusView", 
	"navigation/Navigation", 
	"navigation/NavigationView", 
	"activity_feed/ActivityFeedItem", 
	"activity_feed/ActivityFeedItemView",
	"data_list/DataList",
	"data_list/DataListView",
	"libs/Utils"
], function(Backbone, Datum, DatumView, DatumStatus, DatumStatusView, Navigation, NavigationView, ActivityFeedItem, ActivityFeedItemView, DataList, DataListView) {
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
			
			var datalistview = new DataList();
//			app.dataList.add(datalistview); we can't have this because datalist view is not a collection
//			 Render datalist view
			var d = new DataListView({
				model : datalistview
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
			var datum = new Datum({
				utterance : "Hello World!"
			});

			// Add it to the global list of Datum
			app.datumList.add(datum);
			app.datumList.create({
				attestation : "Hello World!"
			});

			// Render it as a DatumView
			var view = new DatumView({
				model : datum
			});
			this.$("#content").append(view.render().el);

			var action = new ActivityFeedItem();
			app.activityFeed.add(action);
//			 Render an activity in the activity feed
			var v = new ActivityFeedItemView({
				model : action
			});
			this.$("#activity_feed").append(v.render().el);
			

			
		}
	});

	return AppView;
});
