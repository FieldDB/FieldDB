define([ "use!backbone", 
         "use!handlebars", 
         "text!activity/activity.handlebars",
         "user/UserEditView", 
         "text!user/user_read_link.handlebars", 
         "activity/Activity" ],
    function(Backbone, Handlebars, activityTemplate, User, UserEditView,
        userTemplate, Activity) {
      var ActivityView = Backbone.View.extend(
      /** @lends ActivityView.prototype */
      {
        /**
         * @class The layout of a single Activity. This view is used in the
         *        activity feeds.This view compiles the template that goes into
         *        the view of the collection which in turn goes into the
         *        activity feed.
         * 
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {

        },

        model : Activity,
        userview : UserReadView,
        classname : "activity",
        template : Handlebars.compile(activityTemplate),
        render : function() {

          Handlebars.registerPartial("user", this.userview
              .template(this.userview.model.toJSON()));

          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        },

      });

      return ActivityView;
    });