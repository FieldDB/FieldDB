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
      this.changeViewsOfInternalModels();
      
      //TODO this is how i tested the activity feed database, see the ActivityTest where it is hanging out not being tested.
//          var a = new Activity();
//          a.save();
    },
    changeViewsOfInternalModels : function() {
      if(this.model.get("activities")){
        // Create a CommentReadView     
        this.activitiesView = new PaginatedUpdatingCollectionView({
          collection           : this.model.get("activities"),
          childViewConstructor : ActivityView,
          childViewTagName     : 'li',
          childViewClass        : 'breadcrumb'
        });
      }else{
        alert("bug: activity feed view has no model.");
      }
    },
    model : ActivityFeed,
    
    events : {
      "click .icon-minus-sign" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.format = "minimized"+this.format;
        this.render();
      },
      "click .icon-plus-sign" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.format = this.format.replace("minimized","");
        this.render();
      }
    },
    
    template : Handlebars.templates.activity_feed,
    
    minimizedTemplate : Handlebars.templates.activity_feed_minimized,

    render : function() {
      Utils.debug("ACTIVITY FEED VIEW render");
      this.destroy_view();
      
      if (this.format == "rightSideUser") {
        this.changeViewsOfInternalModels();
        
        this.setElement($("#activity-feed-user"));
        $(this.el).html(this.template(this.model.toJSON()));
       
        this.activitiesView.el = this.$('.activities-updating-collection');
        this.activitiesView.render();
        
        //localization for user non-minimized view
        $(this.el).find(".locale_Refresh_Activities").attr("title", chrome.i18n.getMessage("locale_Refresh_Activities"));
        $(this.el).find(".locale_Hide_Activities").attr("title", chrome.i18n.getMessage("locale_Hide_Activities"));
        $(this.el).find(".locale_Activity_Feed").html(chrome.i18n.getMessage("locale_Activity_Feed_Your"));

      }else if (this.format == "rightSideCorpusTeam") {
        this.changeViewsOfInternalModels();

        this.setElement($("#activity-feed-corpus-team"));
        $(this.el).html(this.template(this.model.toJSON()));
       
        this.activitiesView.el = this.$('.activities-updating-collection');
        this.activitiesView.render();
        
        //localization for team non-minimized view
        $(this.el).find(".locale_Refresh_Activities").attr("title", chrome.i18n.getMessage("locale_Refresh_Activities"));
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
    },
    /**
     * 
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      Utils.debug("DESTROYING ACTIIVITYFEED VIEW "+ this.format);
      if (this.format.indexOf("minimized") == -1){
        this.activitiesView.destroy_view();
      }
      //COMPLETELY UNBIND THE VIEW
      this.undelegateEvents();

      $(this.el).removeData().unbind(); 

      //Remove view from DOM
//      this.remove();  
//      Backbone.View.prototype.remove.call(this);
      }

  });

  return ActivityFeedView;
});