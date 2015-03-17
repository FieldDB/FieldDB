var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var DatumFields = require("./../datum/DatumFields").DatumFields;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

var DEFAULT_CORPUS_MODEL = require("./../corpus/corpus.json");
/**
  * @class The Session widget is the place where information which is generally
  * shared by many datum (due to being part of an elicitiation session)
  * @property {Number} sessionID The session ID is an automatically generated
  *           number which will uniquely identify the session.
  * @property {String} user The user is the person inputting the data for
  *           that session.
  * @property {String} team The team is the team that the user belongs to.
  * @property {String} consultant The consultant is the native speaker of the
  *           language under investigation that has verified the data in the
  *           session.
  * @property {String} language The language is the language under
  *           investigation in the particular session.
  * @property {String} languageFamily The language family is an attribute
  *           which users can use to group languages.
  * @property {String} dialect The dialect specifies the dialect of the
  *           language under investigation.
  * @property {String} date The date is the date that the data was elicited.
  * @property {String} goal The goal is the particular linguistic goal that
  *           the researcher was pursuing during that session.
  *
  *  new DatumField({
        label : "user",
        shouldBeEncrypted: "",
        userchooseable: "disabled"
      }),
      new DatumField({
        label : "consultants",
        shouldBeEncrypted: "",
        userchooseable: "disabled"
      }),
      new DatumField({
        label : "language",
        shouldBeEncrypted: "",
        userchooseable: "disabled",
        help: "This is the langauge (or language family) if you would like to use it."
      }),
      new DatumField({
        label : "dialect",
        shouldBeEncrypted: "",
        userchooseable: "disabled",
        help: "You can use this field to be as precise as you would like about the dialect of this session."
      }),
      new DatumField({
        label : "dateElicited",
        shouldBeEncrypted: "",
        userchooseable: "disabled",
        help: "This is the date in which the session took place."
      }),
      new DatumField({
        label : "dateSEntered",
        shouldBeEncrypted: "",
        userchooseable: "disabled",
        help: "This is the date in which the session was entered."
      }),
      new DatumField({
        label : "goal",
        shouldBeEncrypted: "",
        userchooseable: "disabled",
        help: "This describes the goals of the session."
      }),
  *
  *
  *
  * @description The initialize function brings up a page in which the user
  *              can fill out the details corresponding to the session. These
  *              details will be linked to each datum submitted in the
  *              session.
  * @name  Session
  * @extends FieldDBObject
  * @constructs
*/
var Session = function Session(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Session";
  }
  this.debug("Constructing Session: ", options);
  if (!options || (!options._rev && !options.fields)) {
    //If its a new participant with out a revision and without fields use the defaults
    this.fields = this.defaults.fields;
  }
  FieldDBObject.apply(this, arguments);
};

Session.prototype = Object.create(FieldDBObject.prototype, /** @lends Session.prototype */ {
  constructor: {
    value: Session
  },
  goal: {
    get: function() {
      var goal = "";
      try {
        goal = this.get("sessionFields").where({
          label: "goal"
        })[0].get("mask");
      } catch (e) {
        this.debug("This session doesnt seem to have a goal.");
      }
      return goal;
    },
    set: function(value) {
      this.todo("set goal", value);
    }
  },

  // The couchdb-connector is capable of mapping the url scheme
  // proposed by the authors of Backbone to documents in your database,
  // so that you don't have to change existing apps when you switch the sync-strategy
  api: {
    value: "sessions"
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      fields: DatumFields,
      confidential: Confidential
    }
  },

  sessionFields: {
    get: function() {
      return this.feilds;
    },
    set: function(value) {
      this.warn("sessionFields are depreacted, use fields instead");
      return this.fields = value;
    }
  },

  defaults: {
    get: function() {
      var doc = {
        fields: DEFAULT_CORPUS_MODEL.sessionFields
      };
      return JSON.parse(JSON.stringify(doc));
    }
  },

  confidentiality: {
    get: function() {
      if (this.fields) {
        return this.fields.confidentiality.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (!this.fields) {
        this.fields = new DatumFields(this.defaults.fields);
      }
      // this.warn("Cannot change the public/private of " + this.collection + " (it must be anonymous). " + value);
      this.fields.confidentiality.value = value;
    }
  },

  user: {
    get: function() {
      if (this.fields && this.fields.participants && this.fields.participants.value) {
        // this.debug("this.fields.participants.value :", this.fields.participants.value + ":");

        if (this.fields.confidentiality.value === "generalize") {
          this.fields.participants.mask = "A native session";
        } else if (this.fields.confidentiality.value === "team") {
          this.todo("IF the user is part of the team, they can see the participants of the consultant.");
          this.fields.participants.mask = this.anonymousCode;
        } else if (this.fields.confidentiality.value === "anonymous") {
          this.fields.participants.mask = this.anonymousCode || this.fields.participants.mask;
        } else if (this.fields.confidentiality.value === "public") {
          this.fields.participants.mask = this.fields.participants.value;
        } else {
          this.fields.participants.mask = "A native session";
        }

        if (this.fields.participants.decryptedMode) {
          return this.fields.participants.value;
        } else {
          return this.fields.participants.mask;
        }
      } else {
        if (this.id) {
          return this.id;
        }
        return;
      }
    },
    set: function(value) {
      if (!this.confidential) {
        this.warn("Cannot set the participants before the confidential is set");
        return;
      }
      if (!this.fields) {
        this.fields = new DatumFields(this.defaults.fields);
      }
      // this.fields.participants.debugMode = true;
      // this.fields.participants.decryptedMode = true;
      this.fields.participants.confidential = this.confidential;
      this.fields.participants.value = value;
    }
  },

  encryptByCorpus: {
    value: true
  },

  confidential: {
    get: function() {
      return this.confidentialEncrypter;
    },
    set: function(value) {
      if (value === this.confidentialEncrypter) {
        return;
      }
      if (typeof value.encrypt !== "function" && value.secretkey) {
        value = new this.INTERNAL_MODELS["confidential"](value);
      }
      this.confidentialEncrypter = value;
      if (this.fields) {
        // this.debug("setting session fields confidential in the Session.confidential set function.");
        this.fields.confidential = value;
      }
    }
  },
  languages: {
    get: function() {
      if (this.fields) {
        return this.fields.languages.value;
      } else {
        return;
      }
    },
    set: function(value) {
      var stringvalue;
      var objectvalue;
      if (typeof value === "string") {
        this.debug("User set the languages with a string");
        if (this.fields.languages && this.fields.languages && this.fields.languages.json) {
          this.confirm("Do you want to set the languages from " + JSON.stringify(this.fields.languages.json) + " to " + value);
        }
        stringvalue = value;
        objectvalue = {
          value: value,
          label: "languages",
          json: {
            languages: value.split(",")
          }
        };
        objectvalue.json.languages = objectvalue.json.languages.map(function(languageName) {
          return {
            iso: languageName.toLowerCase().trim(),
            name: languageName.trim(),
            nativeName: languageName.trim()
          };
        });
      } else {
        objectvalue = value;
      }

      if (!this.fields) {
        this.fields = new DatumFields(this.defaults.fields);
      }
      if (stringvalue) {
        this.fields.languages.value = stringvalue;
      }
      this.debug("setting language ", objectvalue);

      for (var property in objectvalue) {
        if (!objectvalue.hasOwnProperty(property)) {
          continue;
        }
        this.debug("looking at " + property);
        this.fields.languages[property] = objectvalue[property];
      }
    }
  },

  dialects: {
    get: function() {
      return this.languages;
    },
    set: function(value) {
      return this.languages = value;
    }
  },

  decryptedMode: {
    get: function() {
      return this._decryptedMode;
    },
    set: function(value) {
      this._decryptedMode = value;
      if (this._fields) {
        this._fields.decryptedMode = value;
      }
    }
  },


  /**
   * Accepts two functions to call back when save is successful or
   * fails. If the fail callback is not overridden it will alert
   * failure to the user.
   *
   * - Adds the session to the corpus if it is in the right corpus, and wasnt already there
   * - Adds the session to the user if it wasn't already there
   * - Adds an activity to the logged in user with diff in what the user changed.
   *
   * @param successcallback
   * @param failurecallback
   */
  saveAndInterConnectInApp: {
    value: function(successcallback, failurecallback) {
      var self = this;
      var newModel = true;
      if (this.id) {
        newModel = false;
      } else {
        this.set("dateCreated", JSON.stringify(new Date()));
      }
      this.debug("Saving the Session");
      //protect against users moving sessions from one corpus to another on purpose or accidentially
      if (self.application.get("corpus").get("pouchname") !== this.get("pouchname")) {
        if (typeof failurecallback === "function") {
          failurecallback();
        } else {
          this.bug("Session save error. I cant save this session in this corpus, it belongs to another corpus. ");
        }
        return;
      }
      var oldrev = this.get("_rev");
      this.set("dateModified", JSON.stringify(new Date()));
      this.set("timestamp", Date.now());
      self.save(null, {
        success: function(model, response) {
          self.debug("Session save success");
          var goal = model.get("sessionFields").where({
            label: "goal"
          })[0].get("mask");
          var differences = "#diff/oldrev/" + oldrev + "/newrev/" + response._rev;
          //TODO add privacy for session goals in corpus
          //            if(self.application.get("corpus").get("keepSessionDetailsPrivate")){
          //              goal = "";
          //              differences = "";
          //            }
          if (self.application) {
            self.application.toastUser("Sucessfully saved session: " + goal, "alert-success", "Saved!");
            self.application.addSavedDoc(model.id);
          }
          var verb = "modified";
          var verbicon = "icon-pencil";
          if (newModel) {
            verb = "added";
            verbicon = "icon-plus";
          }
          self.application.addActivity({
            verb: "<a href='" + differences + "'>" + verb + "</a> ",
            verbicon: verbicon,
            directobjecticon: "icon-calendar",
            directobject: "<a href='#session/" + model.id + "'>" + goal + "</a> ",
            indirectobject: "in <a href='#corpus/" + self.application.get("corpus").id + "'>" + self.application.get("corpus").get("title") + "</a>",
            teamOrPersonal: "team",
            context: " via Offline App."
          });

          self.application.addActivity({
            verb: "<a href='" + differences + "'>" + verb + "</a> ",
            verbicon: verbicon,
            directobjecticon: "icon-calendar",
            directobject: "<a href='#session/" + model.id + "'>" + goal + "</a> ",
            indirectobject: "in <a href='#corpus/" + self.application.get("corpus").id + "'>" + self.application.get("corpus").get("title") + "</a>",
            teamOrPersonal: "personal",
            context: " via Offline App."
          });

          /*
           * make sure the session is visible in this corpus
           */
          var previousversionincorpus = self.application.get("corpus").sessions.get(model.id);
          if (previousversionincorpus === undefined) {
            self.application.get("corpus").sessions.unshift(model);
          } else {
            self.application.get("corpus").sessions.remove(previousversionincorpus);
            self.application.get("corpus").sessions.unshift(model);
          }
          self.application.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = model.id;
          //make sure the session is in the history of the user
          if (self.application.get("authentication").get("userPrivate").get("sessionHistory").indexOf(model.id) === -1) {
            self.application.get("authentication").get("userPrivate").get("sessionHistory").unshift(model.id);
          }
          //            self.application.addUnsavedDoc(self.application.get("authentication").get("userPrivate").id);
          self.application.get("authentication").saveAndInterConnectInApp();

          if (typeof successcallback === "function") {
            successcallback();
          }
        },
        error: function(e, f, g) {
          self.debug("Session save error", e, f, g);
          if (typeof failurecallback === "function") {
            failurecallback();
          } else {
            self.bug("Session save error: " + f.reason);
          }
        }
      });
    }
  },
  /**
   * Accepts two functions success will be called if sucessfull,
   * otherwise it will attempt to render the current session views. If
   * the session isn't in the current corpus it will call the fail
   * callback or it will alert a bug to the user. Override the fail
   * callback if you don't want the alert.
   *
   * @param successcallback
   * @param failurecallback
   */
  setAsCurrentSession: {
    value: function(successcallback, failurecallback) {
      var self = this;
      if (self.application.get("corpus").get("pouchname") !== this.get("pouchname")) {
        if (typeof failurecallback === "function") {
          failurecallback();
        } else {
          self.bug("This is a bug, cannot load the session you asked for, it is not in this corpus.");
        }
        return;
      }

      if (self.application.get("currentSession").id !== this.id) {
        self.application.set("currentSession", this); //This results in a non-identical session in the currentsession with the one live in the corpus sessions collection.
        //      self.application.set("currentSession", app.get("corpus").sessions.get(this.id)); //this is a bad idea too, use above instead
      }
      self.application.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = this.id;
      self.application.get("authentication").saveAndInterConnectInApp(); //saving users is cheep

      if (self.application) {
        self.application.setUpAndAssociateViewsAndModelsWithCurrentSession(function() {
          if (typeof successcallback === "function") {
            successcallback();
          } else {
            self.application.currentSessionReadView.format = "leftSide";
            self.application.currentSessionReadView.render();
            self.application.toastUser("Sucessfully connected all views up to session: " + this.id, "alert-success", "Connected!");
            //          self.application.renderEditableSessionViews("leftSide");
            //          self.application.renderReadonlySessionViews("leftSide");
          }
        });
      } else {
        if (typeof successcallback === "function") {
          successcallback();
        }
      }
    }
  }

});
exports.Session = Session;
