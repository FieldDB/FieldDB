define([
    "backbone",
    "insert_unicode/InsertUnicode",
    "insert_unicode/InsertUnicodes"
], function(
    Backbone,
    InsertUnicode,
    InsertUnicodes
) {
  var UserPreference = Backbone.Model.extend(
  /** @lends UserPreference.prototype */
  {
    /**
     * @class Hold preferences for users like the skin of the app
     * 
     * @property {int} skin This is user's preferred skin.
     * @property {int} numVisibleDatum The number of Datum visible at the time on
     * the Datum*View's.
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("USER PREFERENCE init");
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
      if(OPrime.apptype == "myaamia")
      {// do some prefs for myaamia users}
    	  /*
    	   if(OPrime.apptype == "myaamia" && app.get("authentication").get("userPrivate").get("username") == "public"){
       this.set("transparentDashboard", "true");
     } 
    	   */
      }
    },
    fillWithDefaults : function(){
      if(this.get("unicodes") == undefined){
        this.set("unicodes", new InsertUnicodes());
      }//end if to set unicode
      if(this.get("unicodes").models.length == 0){
        this.get("unicodes").fill();
      }
    },
    defaults : {
      skin : "",
      numVisibleDatum : 2, //Use two as default so users can see minimal pairs
      transparentDashboard: "false",
      alwaysRandomizeSkin : "true",
      numberOfItemsInPaginatedViews : 10
    },
    
    // Internal models: used by the parse function
    internalModels : {
      unicodes : InsertUnicodes
    },

    originalParse : Backbone.Model.prototype.parse,
    parse: function(originalModel) {
      if (originalModel) {
        if (originalModel.preferedDashboardLayout) {
          originalModel.preferredDashboardLayout = originalModel.preferedDashboardLayout;
        }
      }
      return this.originalParse(originalModel);
    },

    saveAndInterConnectInApp : function(callback){
      if(typeof callback == "function"){
        callback();
      }
    }
    
  });

  return UserPreference;
});
