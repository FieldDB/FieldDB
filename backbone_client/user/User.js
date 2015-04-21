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
      var tmp,
      normalizedConnection;

      /* upgrade to 2.40+ data structures */
      originalModel.corpora = originalModel.corpora || originalModel.corpuses;
      originalModel.userMask = originalModel.userMask || originalModel.publicSelf;
      delete originalModel.corpuses;

      var corporaUserHasAccessTo = localStorage.getItem(originalModel.username + "corporaUserHasAccessTo");
      if (corporaUserHasAccessTo && corporaUserHasAccessTo.indexOf("[") === 0) {
        corporaUserHasAccessTo = JSON.parse(corporaUserHasAccessTo);
        corporaUserHasAccessTo = new FieldDB.Corpora(corporaUserHasAccessTo);
        corporaUserHasAccessTo.add(originalModel.corpora);
        corporaUserHasAccessTo.remove("public-firstcorpus");
        originalModel.corpora = corporaUserHasAccessTo.toJSON();
      }

      originalModel.authUrl = OPrime.getAuthUrl(originalModel.authUrl);
      originalModel.activityConnection = originalModel.activityConnection || originalModel.activityCouchConnection;
      delete originalModel.activityCouchConnection;
      if (originalModel.activityConnection) {
        originalModel.activityConnection = new FieldDB.Connection(originalModel.activityConnection);
        normalizedConnection = OPrime.defaultConnection();
        normalizedConnection.dbname = originalModel.activityConnection.dbname;
        originalModel.activityConnection.merge("self", normalizedConnection, "overwrite");
        originalModel.activityConnection = originalModel.activityConnection.toJSON()
      }

      if (originalModel.mostRecentIds ) {
        originalModel.mostRecentIds.connection = originalModel.mostRecentIds.connection || originalModel.mostRecentIds.couchConnection;
        originalModel.mostRecentIds.connection = new FieldDB.Connection(originalModel.mostRecentIds.connection);
        normalizedConnection = OPrime.defaultConnection();
        normalizedConnection.dbname = originalModel.mostRecentIds.connection.dbname;
        originalModel.mostRecentIds.connection.merge("self", normalizedConnection, "overwrite");
        originalModel.mostRecentIds.connection = originalModel.mostRecentIds.connection.toJSON();
        delete originalModel.mostRecentIds.couchConnection;
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
      var username = this.get("username");
      if (username == "public") {
        return;
      }
      if(this.currentlyCalculatingRoles && this.currentlyCalculatingRoles.length === roles.length){
        return;
      }
      this.currentlyCalculatingRoles = roles;

      var corpora = this.get("corpora");
      if (corpora) {
        if (corpora.toJSON) {
          corpora = corpora.toJSON();
        }
        corpora = new FieldDB.Corpora(corpora);
      } else {
        corpora = new FieldDB.Corpora();
      }

      for (var role in roles) {
        var dbname = roles[role].replace(/_admin|_writer|_reader|_commenter|fielddbuser/g, "");
        if (dbname && !corpora[dbname] && dbname !== "public-firstcorpus") {
          newconnection = new FieldDB.Connection(OPrime.defaultConnection());
          newconnection.dbname = dbname;
          if (newconnection.title && newconnection.title.length > 30) {
            newconnection.title = newconnection.title.replace(username + "-", "");
          }
          if (newconnection.title && newconnection.title.length > 30) {
            newconnection.title = newconnection.title.substring(0, 10) + "..." + newconnection.title.substring(newconnection.title.length - 15, newconnection.title.length - 1);
          }
          newconnection.id = newconnection.dbname;
          corpora.add(newconnection.toJSON());
        } else {
          OPrime.debug(dbname + " Already known");
        }
      }
      // corpora = new Corpuses(corpora.toJSON());
      corpora = corpora.toJSON();
      this.set("corpora", corpora);
      window.app.set("corporaUserHasAccessTo", corpora);
      localStorage.setItem(username + "corporaUserHasAccessTo", JSON.stringify(corpora));
    }

  });

  return User;
});
