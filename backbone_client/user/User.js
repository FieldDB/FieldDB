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
        originalModel.corpora[corpusIndex] = OPrime.defaultConnection();
        originalModel.corpora[corpusIndex].corpusid = tmp.corpusid;
        originalModel.corpora[corpusIndex].dbname = tmp.dbname;
        originalModel.corpora[corpusIndex].title = tmp.title;
        originalModel.corpora[corpusIndex].description = tmp.description;
        originalModel.corpora[corpusIndex].titleAsUrl = tmp.titleAsUrl;
      }
      if (originalModel.mostRecentIds && originalModel.mostRecentIds.connection) {
        tmp = originalModel.mostRecentIds.connection;
        originalModel.mostRecentIds.connection = OPrime.defaultConnection();
        originalModel.mostRecentIds.connection.corpusid = tmp.corpusid;
        originalModel.mostRecentIds.connection.dbname = tmp.dbname;
        originalModel.mostRecentIds.connection.title = tmp.title;
        originalModel.mostRecentIds.connection.description = tmp.description;
        originalModel.mostRecentIds.connection.titleAsUrl = tmp.titleAsUrl;
      }
      if (originalModel.activityConnection) {
        tmp = originalModel.activityConnection;
        originalModel.activityConnection = OPrime.defaultConnection();
        originalModel.activityConnection.dbname = tmp.dbname;
      }

      var connection = originalModel.mostRecentIds.connection;
      if (!connection) {
        connection = originalModel.corpora[0];
        originalModel.mostRecentIds.connection = connection;
      }
      if (!connection) {
        if (window.location.pathname.indexOf("user.html") === -1) {
          OPrime.bug("Could not figure out what was your most recent corpus, taking you to your user page where you can choose.");
          window.location.replace("user.html");
          return;
        } else {
          alert("There was an error loading your user, please report this");
        }
      }

      /* Upgrade chrome app user corpora's to v1.38+ */
      if(connection && connection.domain == "ifielddevs.iriscouch.com"){
        connection.domain  = "corpus.lingsync.org";
        connection.port = "";
      }
      /* Upgrade chrome app user corpora's to v1.90+ */
      if(connection && connection.domain == "corpusdev.lingsync.org"){
        connection.domain  = "corpus.lingsync.org";
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

    updateListOfCorpora: function(roles, connectionInscope){
      var corpora =  new Corpuses();
      var username = this.get("username");
      if(username == "public"){
        return;
      }
      if(!connectionInscope){
        connectionInscope = window.app.get("connection");
      }
      for (var role in roles) {
        var thisConnection = JSON.parse(JSON.stringify(connectionInscope));
        thisConnection.corpusid = "";
        thisConnection.dbname = roles[role].replace(/_admin|_writer|_reader|_commenter|fielddbuser/g, "");
        thisConnection.title = thisConnection.dbname;
        if (thisConnection.title.length > 30) {
          thisConnection.title = thisConnection.title.replace(username + "-", "");
        }
        if (thisConnection.title.length > 30) {
          thisConnection.title = thisConnection.title.substring(0, 10) + "..." + thisConnection.title.substring(thisConnection.title.length - 15, thisConnection.title.length - 1);
        }
        thisConnection.id = thisConnection.dbname;
        if (thisConnection.dbname.length > 4 && thisConnection.dbname.split("-").length === 2) {
          if (corpora.where({
            "dbname": thisConnection.dbname
          }).length === 0) {
            corpora.push(new CorpusMask(thisConnection));
          } else {
            OPrime.debug(thisConnection.dbname + " Already known");
          }
        }
      }
      window.app.set("corporaUserHasAccessTo", corpora);
      localStorage.setItem(username + "corporaUserHasAccessTo", JSON.stringify(corpora.toJSON()));
    }

  });

  return User;
});
