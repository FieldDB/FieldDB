define("activity_feed/ActivityFeedItem", [
    "use!backbone",
    "user/User"
], function(Backbone, DatumStatus, DatumMenu, DatumTag, Preference, Session) {
    var ActivityFeedItem = Backbone.Model.extend(
    /** @lends Datum.prototype */
    {
        /**
         * @class The Activity Feed Item 
         * 
         * @extends Backbone.Model
         * @constructs
         */
        initialize : function() {
            this.bind('error', function(model, error) {
                console.log("Error in Activity Feed Item: "+ error);
            });

        },

        defaults : {
        	user: window.user,
        	verbs: ["added","modified","commented","checked"],
        	verb: "added",
        	directobject:"an entry",
        	indirectobject:"with Informant-SJ"
        }

    });

    return ActivityFeedItem;
});
