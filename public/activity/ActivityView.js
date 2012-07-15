define([ 
    "backbone", 
    "handlebars", 
    "activity/Activity",
    "user/UserReadView"
], function(
    Backbone, 
    Handlebars, 
    Activity,
    UserReadView
) {
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
      Utils.debug("ACTIVITY VIEW init");
      this.userView = new UserReadView({
        model : this.model.get("user")
      });
      this.userView.format = "link";

      
    },

    model : Activity,
    
    userView : UserReadView,
       
    classname : "activity",
    
    template : Handlebars.templates.activity,
    
    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.userView.setElement(this.$(".activity-feed-user-link"));
      this.userView.render();
      
      return this;
    }
  });

  return ActivityView;
});