define([ "use!backbone", "use!handlebars", "activity/ActivityFeed", "text!activity/activity_feed.handlebars"
 ],
    function(Backbone, Handlebars, ActivityFeed, activity_feedTemplate) {
      var ActivityFeedView = Backbone.View.extend(
      /** @lends ActivityFeedView.prototype */
      {
        /**
         * @class The layout of the activity feed. This view is used in web
         *        widgets, it is also embeddable in the dashboard.
         * 
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : ActivityFeed,
        classname : "activity_feed",
        template : Handlebars.compile(activity_feedTemplate),

        render : function() {
          this.setElement($("#activity_feed"));
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        }

      });

      return ActivityFeedView;
    });