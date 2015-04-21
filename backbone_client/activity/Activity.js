define([
    "backbone",
    "user/UserMask"
], function(
    Backbone,
    UserMask
) {
  var Activity = Backbone.Model.extend(
  /** @lends Activity.prototype */
  {
    /**
     * @class The Activity is a record of the user's activity during one
     *        session, i.e. it might say "Edward LingLlama added 30 datums in Na
     *        Dene Corpus" This is so that users can see their history and teams
     *        can view teammate's contributions.
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("ACTIVITY init: ");

      if(!this.get("user")) {
        var user = window.app.get("authentication").get("userPublic").toJSON();
        this.set("user", {
          username: user.username,
          gravatar: user.gravatar,
          authUrl: user.authUrl
        });
        //        if(!this.get("dbname")) {
//          this.set("dbname", window.app.get("authentication").get("userPrivate").get("activityConnection").dbname);
//        }
      }
      if(!this.get("timestamp")){
        this.set("timestamp", Date.now() );
        this.set("dateModified", JSON.stringify(new Date()) );
      }
      if( !this.get("teamOrPersonal")){
         this.set("teamOrPersonal", "personal");
      }
      if (!this.get("appVersion")) {
        this.set("appVersion", OPrime.getMostLikelyPrototypeVersionFromUrl(window.app.get("version")));
      }

//      if(this.isNew()){
//        this.saveAndInterConnectInApp();
//      }
    },
    /**
     * backbone-couchdb adaptor set up
     */

    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/activities",

    defaults : {
//      verbs : [ "added", "modified", "commented", "checked", "tagged", "uploaded" ],
//      verb : "added",
//      directobject : "an entry",
//      indirectobject : "with Consultant-SJ",
//      context : "via Android/ Offline Chrome App" ,
//      link: "https:/www.fieldlinguist.com"
//      timestamp: timestamp
    },

    // Internal models: used by the parse function
    model : {
      user : UserMask
    },
    changePouch : function(dbname, callback) {
      if(!dbname){
        if( this.get("teamOrPersonal") == "personal"){
          if(this.get("user").get("username") ==  window.app.get("authentication").get("userPublic").get("username")){
            dbname = window.app.get("authentication").get("userPrivate").get("activityConnection").dbname;
            this.set("dbname", dbname);
          }else{
            alert("Bug in setting the pouch for this activity, i can only save activities from the current logged in user, not other users");
            return;
          }
        }else{
          try{
            dbname = window.app.get("currentCorpusTeamActivityFeed").get("connection").dbname;
            this.set("dbname", dbname);
          }catch(e){
            alert("Bug in setting the pouch for this activity, i can only save activities for the current corpus team.");
            return;
          }

        }
      }


      if(OPrime.isBackboneCouchDBApp()){
        if(typeof callback == "function"){
          callback();
        }
        return;
      }

      if(this.pouch == undefined){
        this.pouch = Backbone.sync.pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + dbname : OPrime.pouchUrl + dbname);
      }
      if(typeof callback == "function"){
        callback();
      }
    },
    /**
     * Accepts two functions to call back when save is successful or
     * fails. If the fail callback is not overridden it will alert
     * failure to the user.
     *
     * - Adds the Activity to the corpus if it is in the right corpus, and wasnt already there
     * - Adds the Activity to the user if it wasn't already there
     * - Adds an activity to the logged in user with diff in what the user changed.
     *
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(activsuccesscallback, activfailurecallback){
      if (OPrime.debugMode) OPrime.debug("Saving the Activity");
      var self = this;
      if(! this.isNew()){
        if (OPrime.debugMode) OPrime.debug('Activity doesnt need to be saved.');
        if(typeof activsuccesscallback == "function"){
          activsuccesscallback();
        }
        return;
      }
      //save via pouch
      this.changePouch(null, function(){
        self.save(null, {
          success : function(model, response) {
            if (OPrime.debugMode) OPrime.debug('Activity save success');

            if(typeof activsuccesscallback == "function"){
              activsuccesscallback();
            }
          },
          error : function(e) {
            if(typeof activfailurecallback == "function"){
              activfailurecallback();
            }else{
              alert('Activity save error' + e);
            }
          }
        });
      });

    }

  });


  return Activity;
});
