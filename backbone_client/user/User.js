define([
    "backbone",
    "corpus/CorpusMask",
    "corpus/Corpuses",
    "hotkey/HotKey",
    "user/UserGeneric",
    "user/UserPreference",
    "OPrime"
], function(
    Backbone,
    CorpusMask,
    Corpuses,
    HotKey,
    UserGeneric,
    UserPreference
) {
  var User = UserGeneric.extend(
  /** @lends User.prototype */
  {
    /**
     * @class User extends from UserGeneric. It inherits the same attributes as UserGeneric but can
     * login.
     *
     * @property {String} firstname The user's first name.
     * @property {String} lastname The user's last name.
     * @property {Array} teams This is a list of teams a user belongs to.
     * @property {Array} sessionHistory
     * @property {Permission} permissions This is where permissions are specified (eg. read only; add/edit data etc.)
     *
     * @description The initialize function probably checks to see if the user is existing or new and creates a new account if it is new.
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize: function(attributes) {
      if (OPrime.debugMode) OPrime.debug("USER init");
      User.__super__.initialize.call(this, attributes);

      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
      this.bind("change", this.checkPrefsChanged, this);
    },
    fillWithDefaults : function(){
      // If there is no prefs, create a new one
      if (!this.get("prefs")) {
        this.set("prefs", new UserPreference({filledWithDefaults : true }));
      }

      // If there is no hotkeys, create a new one
      if (!this.get("hotkeys")) {
        this.set("hotkeys", new HotKey({filledWithDefaults : true }));//TODO this needs to become plural when hotkeys get implemented
      }
    },
    originalParse : Backbone.Model.prototype.parse,
    parse: function(originalModel) {
      var tmp;
      originalModel.corpora = originalModel.corpora || originalModel.corpuses;
      var corporaUserHasAccessTo = localStorage.getItem(originalModel.username + "corporaUserHasAccessTo");
      if(corporaUserHasAccessTo){
        originalModel.corpora = JSON.parse(corporaUserHasAccessTo);
      }
      for (var corpusIndex = 0; corpusIndex < originalModel.corpora.length; corpusIndex++) {
        tmp = originalModel.corpora[corpusIndex];
        originalModel.corpora[corpusIndex] = OPrime.defaultCouchConnection();
        originalModel.corpora[corpusIndex].corpusid = tmp.corpusid;
        originalModel.corpora[corpusIndex].pouchname = tmp.pouchname;
        originalModel.corpora[corpusIndex].title = tmp.title;
        originalModel.corpora[corpusIndex].description = tmp.description;
        originalModel.corpora[corpusIndex].titleAsUrl = tmp.titleAsUrl;
      }
      if (originalModel.mostRecentIds && originalModel.mostRecentIds.couchConnection) {
        tmp = originalModel.mostRecentIds.couchConnection;
        originalModel.mostRecentIds.couchConnection = OPrime.defaultCouchConnection();
        originalModel.mostRecentIds.couchConnection.corpusid = tmp.corpusid;
        originalModel.mostRecentIds.couchConnection.pouchname = tmp.pouchname;
        originalModel.mostRecentIds.couchConnection.title = tmp.title;
        originalModel.mostRecentIds.couchConnection.description = tmp.description;
        originalModel.mostRecentIds.couchConnection.titleAsUrl = tmp.titleAsUrl;
      }
      if (originalModel.activityCouchConnection) {
        tmp = originalModel.activityCouchConnection;
        originalModel.activityCouchConnection = OPrime.defaultCouchConnection();
        originalModel.activityCouchConnection.pouchname = tmp.pouchname;
      }

      var couchConnection = originalModel.mostRecentIds.couchConnection;
      if (!couchConnection) {
        couchConnection = originalModel.corpora[0];
        originalModel.mostRecentIds.couchConnection = couchConnection;
      }
      if (!couchConnection) {
        if (window.location.pathname.indexOf("user.html") === -1) {
          OPrime.bug("Could not figure out what was your most recent corpus, taking you to your user page where you can choose.");
          window.location.replace("user.html");
          return;
        } else {
          alert("There was an error loading your user, please report this");
        }
      }

      /* Upgrade chrome app user corpora's to v1.38+ */
      if(couchConnection && couchConnection.domain == "ifielddevs.iriscouch.com"){
        couchConnection.domain  = "corpus.lingsync.org";
        couchConnection.port = "";
      }
      /* Upgrade chrome app user corpora's to v1.90+ */
      if(couchConnection && couchConnection.domain == "corpusdev.lingsync.org"){
        couchConnection.domain  = "corpus.lingsync.org";
      }

      return this.originalParse(originalModel);
    },
    defaults : {
      // Defaults from UserGeneric
      username : "",
      password : "",
      email : "",
      gravatar : "0df69960706112e38332395a4f2e7542",
      researchInterest : "",
      affiliation : "",
      description : "",
      subtitle : "",
      corpora : [],
      dataLists : [],
      mostRecentIds : {},
      // Defaults from User
      firstname : "",
      lastname : "",
      teams : [],
      sessionHistory : []
    },

    /**
     * The subtitle function returns user's first and last names.
     */
    subtitle: function () {
    	if (this.get("firstname") == undefined) {
        this.set("firstname","");
      }

      if (this.get("lastname") == undefined) {
        this.set("lastname","");
      }

      return this.get("firstname") + " " + this.get("lastname");
    },
    checkPrefsChanged : function(){
      try{
        window.appView.userPreferenceView.model = this.get("prefs");
        window.appView.userPreferenceView.render();
      }catch(e){

      }
    },
    saveAndInterConnectInApp : function(callback){

      if(typeof callback == "function"){
        callback();
      }
    },

    updateListOfCorpora: function(roles, couchConnectionInscope){
      var corpora =  new Corpuses();
      var username = this.get("username");
      if(username == "public"){
        return;
      }
      if(!couchConnectionInscope){
        couchConnectionInscope = window.app.get("couchConnection");
      }
      for (var role in roles) {
        var thisCouchConnection = JSON.parse(JSON.stringify(couchConnectionInscope));
        thisCouchConnection.corpusid = "";
        thisCouchConnection.pouchname = roles[role].replace(/_admin|_writer|_reader|_commenter|fielddbuser/g, "");
        thisCouchConnection.title = thisCouchConnection.pouchname;
        if (thisCouchConnection.title.length > 30) {
          thisCouchConnection.title = thisCouchConnection.title.replace(username + "-", "");
        }
        if (thisCouchConnection.title.length > 30) {
          thisCouchConnection.title = thisCouchConnection.title.substring(0, 10) + "..." + thisCouchConnection.title.substring(thisCouchConnection.title.length - 15, thisCouchConnection.title.length - 1);
        }
        thisCouchConnection.id = thisCouchConnection.pouchname;
        if (thisCouchConnection.pouchname.length > 4 && thisCouchConnection.pouchname.split("-").length === 2) {
          if (corpora.where({
            "pouchname": thisCouchConnection.pouchname
          }).length === 0) {
            corpora.push(new CorpusMask(thisCouchConnection));
          } else {
            OPrime.debug(thisCouchConnection.pouchname + " Already known");
          }
        }
      }
      window.app.set("corporaUserHasAccessTo", corpora);
      localStorage.setItem(username + "corporaUserHasAccessTo", JSON.stringify(corpora.toJSON()));
    }

  });

  return User;
});
