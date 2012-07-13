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

    },

    model : Activity,
    
    userview : UserReadView,
    
    classname : "activity",
    
    template : Handlebars.template.activity,
    
    render : function() {
      Handlebars.registerPartial("user", this.userview
          .template(this.userview.model.toJSON()));

      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    }
  });

  return ActivityView;
});