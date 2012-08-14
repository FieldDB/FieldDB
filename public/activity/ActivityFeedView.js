define([ 
    "backbone", 
    "handlebars", 
    "activity/Activity", 
    "activity/Activities",
    "activity/ActivityView",
    "activity/ActivityFeed",
    "app/PaginatedUpdatingCollectionView"
 ], function(
    Backbone, 
    Handlebars, 
    Activity, 
    Activities,
    ActivityView,
    ActivityFeed,
    PaginatedUpdatingCollectionView
) {
  var ActivityFeedView = Backbone.View.extend(
  /** @lends ActivityFeedView.prototype */
  {
    /**
     * @class The layout of the activity feed. This view is used in web
     *        widgets, it is also embeddable in the dashboard.
     * 
     * @property {String} format Valid values are "rightSideUser", "rightSideCorpusTeam" and "minimized".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      this.activitiesView = new PaginatedUpdatingCollectionView({
        collection           : this.model.get("activities"),
        childViewConstructor : ActivityView,
        childViewTagName     : 'li'
      });
      
      //TODO this is how i tested the activity feed database, see the ActivityTest where it is hanging out not being tested.
//          var a = new Activity();
//          a.save();
    },

    model : ActivityFeed,
    
    events : {
      "click .icon-minus-sign" : function() {
        this.format = "minimized"+this.format;
        this.render();
      },
      "click .icon-plus-sign" : function() {
        this.format = this.format.replace("minimized","");
        this.render();
      }
    },
    
    template : Handlebars.templates.activity_feed,
    
    minimizedTemplate : Handlebars.templates.activity_feed_minimized,

    render : function() {
      Utils.debug("ACTIVITY FEED VIEW render");
      if (this.format == "rightSideUser") {
        this.setElement($("#activity-feed-user"));
        $(this.el).html(this.template(this.model.toJSON()));
       
        this.activitiesView.el = this.$('.activities-updating-collection');
        this.activitiesView.render();
        
        //localization for user non-minimized view
        $(this.el).find(".locale_Hide_Activities").attr("title", chrome.i18n.getMessage("locale_Hide_Activities"));
        $(this.el).find(".locale_Activity_Feed").html(chrome.i18n.getMessage("locale_Activity_Feed_Your"));

      }else if (this.format == "rightSideCorpusTeam") {
        this.setElement($("#activity-feed-corpus-team"));
        $(this.el).html(this.template(this.model.toJSON()));
       
        this.activitiesView.el = this.$('.activities-updating-collection');
        this.activitiesView.render();
        
        //localization for team non-minimized view
        $(this.el).find(".locale_Hide_Activities").attr("title", chrome.i18n.getMessage("locale_Hide_Activities"));
        $(this.el).find(".locale_Activity_Feed").html(chrome.i18n.getMessage("locale_Activity_Feed_Team"));

      } else if (this.format == "minimizedrightSideUser") {
        this.setElement($("#activity-feed-user"));
        $(this.el).html(this.minimizedTemplate(this.model.toJSON()));

        //localization for user minimized view
        $(this.el).find(".locale_Show_Activities").attr("title", chrome.i18n.getMessage("locale_Show_Activities"));
        $(this.el).find(".locale_Activity_Feed").html(chrome.i18n.getMessage("locale_Activity_Feed_Your"));

      }else if (this.format == "minimizedrightSideCorpusTeam") {
        this.setElement($("#activity-feed-corpus-team"));
        $(this.el).html(this.minimizedTemplate(this.model.toJSON()));

        //localization for team minimized view
        $(this.el).find(".locale_Show_Activities").attr("title", chrome.i18n.getMessage("locale_Show_Activities"));
        $(this.el).find(".locale_Activity_Feed").html(chrome.i18n.getMessage("locale_Activity_Feed_Team"));

      }
      


      return this;
    }

  });

  return ActivityFeedView;
});