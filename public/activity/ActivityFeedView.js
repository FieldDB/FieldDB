define([ "use!backbone", 
         "use!handlebars", 
         "activity/Activity", 
         "activity/ActivityFeed", 
         "text!activity/activity_feed.handlebars"
 ],
    function(Backbone, 
        Handlebars, 
        Activity, 
        ActivityFeed, 
        activity_feedTemplate) {
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
          //TODO this is how i tested the activity feed database, see the ActivityTest where it is hanging out not being tested.
//          var a = new Activity();
//          a.save();
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