var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var DatumFields = require("./DatumFields").DatumFields;
var DataList = require("./../data_list/DataList").DataList;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var Database = require("./../corpus/Database").Database;
var Q = require("q");

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
    //If its a new session with out a revision and without fields use the defaults
    options = options || {};
    options.fields = this.defaults.fields;
  }
  FieldDBObject.apply(this, arguments);
};

Session.prototype = Object.create(FieldDBObject.prototype, /** @lends Session.prototype */ {
  constructor: {
    value: Session
  },

  dateAndGoalSnippet: {
    get: function() {
      var goal = this.goal;
      if (goal.length > 31) {
        goal = goal.substr(0, 30) + "...";
      }
      var dateElicited = this.dateElicited;
      if (dateElicited.length > 16) {
        dateElicited = dateElicited.substr(0, 15) + "...";
      }
      return dateElicited + " : " + goal;
    },
    set: function() {
      this.debug("cant set the snippet.");
    }
  },

  title: {
    get: function() {
      return this.goal;
    },
    set: function(value) {
      this.warn("title is syntactic sugar for goal, if it was used this will make it overwrite the goal field");
      return this.goal = value;
    }
  },

  goal: {
    configurable: true,
    get: function() {
      if (this.fields && this.fields.goal) {
        return this.fields.goal.value;
      } else {
        return FieldDBObject.DEFAULT_STRING;
      }
    },
    set: function(value) {
      if (this.fields && this.fields.goal) {
        // this.fields.debugMode = true;
      } else {
        this.fields = new DatumFields(this.defaults.fields);
      }
      if (!value || (value.indexOf && value.indexOf("Change this session") > -1)) {
        value = "Practice collecting linguistic utterances or words";
      }
      this.fields.goal.value = value;
    }
  },

  date: {
    get: function() {
      return this.dateElicited;
    },
    set: function(value) {
      this.warn("date is syntactic sugar for dateElicited");
      return this.dateElicited = value;
    }
  },

  dateElicited: {
    configurable: true,
    get: function() {
      if (this.fields && this.fields.dateElicited) {
        if (this.fields.dateElicited.value && this.fields.dateElicited.value.indexOf && this.fields.dateElicited.value.indexOf("Change this to a tim") > -1) {
          this.fields.dateElicited.value = "Probably prior to " + new Date(this.dateCreated);
        }
        if (!this.fields.dateElicited.value && this.dateCreated) {
          this.fields.dateElicited.value = new Date(this.dateCreated) + "";
        }
        return this.fields.dateElicited.value;
      } else {
        return FieldDBObject.DEFAULT_STRING;
      }
    },
    set: function(value) {
      if (this.fields) {
        // this.fields.debugMode = true;
      } else {
        this.fields = new DatumFields(this.defaults.fields);
      }
      if (value && value.indexOf && value.indexOf("Change this to a tim") > -1) {
        value = "Probably prior to " + new Date(this.dateCreated);
      }
      this.fields.dateElicited.value = value;
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
      confidential: Confidential,
      docs: FieldDBObject.DEFAULT_COLLECTION,
      docIds: FieldDBObject.DEFAULT_COLLECTION,
      datalist: DataList
    }
  },

  sessionFields: {
    get: function() {
      return this.fields;
    },
    set: function(value) {
      this.warn("sessionFields are depreacted, use fields instead");
      return this.fields = value;
    }
  },

  fields: {
    get: function() {
      this.debug("getting fields");
      return this._fields;
    },
    set: function(value) {
      if (value === this._fields) {
        return;
      }
      if (!value) {
        delete this._fields;
        return;
      } else {
        if (typeof this.INTERNAL_MODELS["fields"] === "function" && Object.prototype.toString.call(value) === "[object Array]") {
          value = new this.INTERNAL_MODELS["fields"](value);
        }
      }
      if (!value.confidential) {
        value.confidential = this.confidential;
      }
      this._fields = value;
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
        this.fields = [];
      }
      // this.warn("Cannot change the public/private of " + this.collection + " (it must be anonymous). " + value);
      this.fields.confidentiality.value = value;
    }
  },

  participants: {
    configurable: true,
    get: function() {
      if (this.fields && this.fields.participants && this.fields.participants.json && this.fields.participants.json.users) {
        return this.fields.participants.json.users;
      } else {
        return;
      }
    },
    set: function(value) {
      if (!this.fields) {
        this.fields = new DatumFields(this.defaults.fields);
      }
      if (typeof value === "string") {
        if (value.indexOf(",") > -1) {
          value = value.split();
        } else {
          value = [value];
        }
        value = value.map(function(username) {
          username = username.trim();
          return {
            username: username,
            name: username,
            gravatar: ""
          };
        });
      }
      if (Object.prototype.toString.call(value) === "[object Array]") {
        var self = this;
        value.map(function(usermask) {
          self.fields.participants.json.users.unshift(usermask);
        });
      } else {
        this.fields.participants.json.users.unshift(value);
      }
    }
  },

  consultants: {
    get: function() {
      var dataEntryPeople = [];
      if (this.fields && this.fields.participants && this.fields.participants.json && this.fields.participants.json.users) {
        this.fields.participants.json.users.map(function(usermask) {
          if (usermask.role && usermask.role.indexOf("speaker") > -1) {
            dataEntryPeople.push(usermask);
          }
        });
        if (dataEntryPeople.length === 0) {
          dataEntryPeople = this.fields.participants.json.users;
        }
      }
      return dataEntryPeople;
    },
    set: function(value) {
      if (!this.fields) {
        this.fields = this.defaults.fields;
      }

      // if (Object.prototype.toString.call(value) === "[object Array]") {
      //   var self = this;
      //   value.map(function(usermask) {
      //     self.consultants = usermask;
      //   });
      //   return;
      // }
      if (typeof value === "string") {
        if (value.indexOf(",") > -1) {
          value = value.split(",");
        } else {
          value = [value];
        }
        value = value.map(function(username) {
          username = username.trim();
          return {
            username: username,
            name: username,
            gravatar: ""
          };
        });
      }
      if (Object.prototype.toString.call(value) !== "[object Array]") {
        value = [value];
      }
      var self = this;
      value = value.map(function(userMask) {
        if (userMask.role) {
          userMask.role = "speaker," + userMask.role;
        } else {
          userMask.role = "speaker";
        }
        self.fields.participants.json.users.unshift(userMask);
        return userMask;
      });

      this.debug("adding consultant", value);
    }
  },

  user: {
    get: function() {
      var dataEntryPeople = [];
      if (this.fields && this.fields.participants && this.fields.participants.json && this.fields.participants.json.users) {
        this.fields.participants.json.users.map(function(usermask) {
          if (usermask.role && usermask.role.indexOf("dataEntry") > -1) {
            dataEntryPeople.push(usermask);
          }
        });
        if (dataEntryPeople.length === 0) {
          dataEntryPeople = this.fields.participants.json.users;
        }
      }
      return dataEntryPeople[0];
    },
    set: function(value) {
      if (!this.fields) {
        this.fields = this.defaults.fields;
      }

      if (typeof value === "string") {
        if (value.indexOf(",") > -1) {
          value = value.split(",");
        } else {
          value = [value];
        }
        value = value.map(function(username) {
          username = username.trim();
          return {
            username: username,
            name: username,
            gravatar: ""
          };
        });
      }

      if (Object.prototype.toString.call(value) !== "[object Array]") {
        value = [value];
      }
      var self = this;
      value = value.map(function(userMask) {
        if (userMask.role) {
          userMask.role = "dataEntry," + userMask.role;
        } else {
          userMask.role = "dataEntry";
        }
        self.fields.participants.json.users.unshift(userMask);
        return userMask;
      });

      this.debug("adding user", value);
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

  docIds: {
    get: function() {
      if (this.datalist && this.datalist.docIds) {
        return this.datalist.docIds;
      }
      return [];
    },
    set: function(value) {
      this._docIds = value;
      if (!this.datalist || !this.datalist.docIds) {
        var self = this;
        Q.nextTick(function() {
          self.datalistUpdatingPromise.then(function() {
            self.debug(" maybe dont need this timeout");
            return self;
          }, function() {
            self.warn("datalist still doesnt exist");
            return self;
          });
        });
        return;
      }
      this.datalist.docIds = value;
    }
  },

  docs: {
    get: function() {
      if (this.datalist && this.datalist.docs) {
        return this.datalist.docs;
      }
    },
    set: function(value) {
      if (!this.datalist || !this.datalist.docs) {
        var self = this;
        Q.nextTick(function() {
          self.datalistUpdatingPromise.then(function() {
            self.datalist.docs.add(value);
          });
        });
        return;
      }
      this.datalist.docs = value;
    }
  },

  add: {
    value: function(value) {
      if (value) {
        if (!this.datalist || !this.datalist.docs) {
          var self = this;
          Q.nextTick(function() {
            self.datalistUpdatingPromise.then(function() {
              self.datalist.docs.add(value);
            });
          });
          return;
        }
        return this.datalist.add(value);
      }
    }
  },

  length: {
    get: function() {
      return this.datalist.length || [];
    },
    set: function(value) {
      this.datalist.length = value;
    }
  },

  datalist: {
    get: function() {
      if (!this._datalist && this.id) {
        var api = "_design/pages/_list/as_data_list/list_of_data_by_session?key=%22" + this.id + "%22";
        this._datalist = new DataList({
          api: api,
          dbname: this.dbname
        });
        if (this._docIds && this._docIds.length > 0) {
          api = this._docIds;
        }
        var self = this;
        self.datalistUpdatingPromise = Database.prototype.fetchCollection(api, null, null, null, null, this.id)
          .then(function(genratedDatalist) {
            self.warn("Downloaded the autogenrated data list of datum ordered by creation date in this session", genratedDatalist);
            if (self._docIds) {
              self.warn("TODO test what happens when there were doc ids before a fetch of ids");
              self._docIds.map(function(docId) {
                self._datalist.add({
                  id: docId
                });
              });
              delete self._docIds;
            }
            if (genratedDatalist) {
              self._datalist.merge(genratedDatalist);
            }
            return self._datalist;
          }, function(err) {
            self.warn(" problem fetching the data list", err);
            self._datalist.docs = self._datalist.docs || [];
            self._datalist.docIds = self._datalist.docIds || self._docIds;
            return self._datalist;
          });
      } else {
        if (!this.datalistUpdatingPromise) {
          var deferred = Q.defer();
          this.datalistUpdatingPromise = deferred.promise;
          deferred.resolve(this._datalist);
        }
      }
      return this._datalist;
    },
    set: function(value) {
      if (value === this._datalist) {
        return;
      }
      if (!value) {
        delete this._datalist;
        return;
      } else {
        if (!(value instanceof this.INTERNAL_MODELS["datalist"])) {
          value = new this.INTERNAL_MODELS["datalist"](value);
        }
      }
      this._datalist = value;
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
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);
      var json = FieldDBObject.prototype.toJSON.apply(this, arguments);

      delete json.datalist;
      if (this._datalist && this._datalist.docIds && this._datalist.docIds.length > 0) {
        json.docIds = this.docIds;
      }

      this.debug(json);
      return json;
    }
  }

});
exports.Session = Session;
