define([ "use!backbone", "use!handlebars", "activity/Activities" ],

function(Backbone, Handlebars, Activities) {
  var ActivitiesView = Backbone.View.extend(
  // TODO paginator.collection.extend

  /** @lends ActivitiesView.prototype */
  {
    /**
     * @class This is the view of the collection of activities. It is where the
     *        activities becomes navigable. The functions such as pagination and
     *        go to next page go here.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
    },

    model : Activity,
    classname : "activities",
    template : Handlebars.compile(activities_viewTemplate),

    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }

  // TODO Navigation and Pagination Functions.

  });

  return ActivitiesView;
});