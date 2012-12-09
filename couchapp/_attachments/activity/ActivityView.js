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
      OPrime.debug("ACTIVITY VIEW init");
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
      var jsonToRender = this.model.toJSON();
      jsonToRender.verb = jsonToRender.verb.replace(/&gt;/g,">").replace(/&lt;/g,"<");
      jsonToRender.directobject = jsonToRender.directobject.replace(/&gt;/g,">").replace(/&lt;/g,"<");
      jsonToRender.indirectobject = jsonToRender.indirectobject.replace(/&gt;/g,">").replace(/&lt;/g,"<");
      jsonToRender.context = jsonToRender.context.replace(/&gt;/g,">").replace(/&lt;/g,"<");
      jsonToRender.timestamp = OPrime.prettyTimestamp(jsonToRender.timestamp);
      
      $(this.el).html(this.template(jsonToRender));
      
      $(this.el).find(".activity_verb").html(jsonToRender.verb);
      $(this.el).find(".activity_direct_object").html(jsonToRender.directobject);
      $(this.el).find(".activity_indirect_object").html(jsonToRender.indirectobject);
      
      this.userView.setElement(this.$(".activity-feed-user-link"));
      this.userView.render();
      
      return this;
    }
  });

  return ActivityView;
});