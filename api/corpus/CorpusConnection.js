/* globals window, URL */

var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var Diacritics = require("diacritic");
/**
 * @class Corpus connections by default define a set of web services which are used by that corpus,
 *         generally on one server. However, over time and use the user might move their audio data to
 *         different servers etc making it more conveint to provide a configuration object which by
 *         convention is the same server, but can be overriden and read by any of the client apps or
 *         webservices. The central authority for a users" corpus is in the user's details on the
 *         user's authentication server.
 *
 *         This class contains basic functions to manipulate CorpusConection json and schema,
 *         can be used as a shared model between clients and servers
 *
 *
 *
 * @param  {CorpusConnection} optionalRequestedCorpusConnection a object with minimally a dbname
 *
 * @param  {string} dbname                 a name space for the database also a url friendly permanent
 *                                         datbase name (composed of a username and an identifier)
 *
 * @param  {string} corpusid               a uuid of the corpus doc within the database which defines the corpus
 * @param  {string} dbname              @deprecated use dbname instead
 * @param  {string} protocol               @deprecated [https:, http] use corpusUrls instead
 * @param  {string} domain                 @deprecated use corpusUrls instead
 * @param  {string} port                   @deprecated use corpusUrls instead
 * @param  {string} path                   @deprecated use corpusUrls instead was used for McGill server
 *
 * @param  {string} userFriendlyServerName a server name that represents where (most of) the user's resources are
 *                                         for this corpus [Default, Beta, Original, Mcgill Prosody, Localhost, etc]
 *
 * @param  {array} clientUrls              an array of objects {"userFriendlyClientName" :
 *                                         [Spreadsheet, Prototype Online, Localhost Chrome App, Public Url, Acivity Feed, etc],
 *                                         url": completeUrlThatCouldBringSomeoneStraightToThisCorpus}
 * @param  {array} corpusUrls              an array of urls which could "compose" this corpus either by overllapping
 *                                         or by union (for the users who want to have meta corpora which combine multiple
 *                                         smaller corpora, or users with large corpora who would like to shard it across servers)
 * @param  {array} audioUrls               an array of audio/video/speech webservice urls which can be used with
 *                                         this corpus, could be youtube, sound cloud or other storage with or
 *                                         without a one-to-one mapping of namespace with this corpus
 * @param  {array} activityUrls            an array of activity feed urls where this corpus"s activities should
 *                                         be stored (usually only one, but oculd have the active one in
 *                                         position 0 and other older ones afterwards)
 *
 * @param  {array} authUrls                an array of strings indicating where a user could login to get to this corpus
 * @param  {array} lexiconUrls             an array of lexicon urls which can be used with this corpus
 * @param  {array} searchUrls              an array of search urls which can be used with this corpus
 *
 * @name  CorpusConnection
 * @extends FieldDBObject
 * @constructs
 */
var CorpusConnection = function CorpusConnection(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "CorpusConnection";
  }
  this.debug("Constructing CorpusConnection ", options);
  if (options) {
    var cleanDefaultValues = ["dbname", "pouchname", "title", "titleAsUrl"];
    cleanDefaultValues.map(function(cleanMe) {
      if (options[cleanMe] === "default") {
        options[cleanMe] = "";
      }
    });
  }
  FieldDBObject.apply(this, arguments);
};



CorpusConnection.DEFAULT_LOCALHOST_CONNECTION = function(options) {
  return {
    "corpusid": "TBA",
    "dbname": options.dbname,
    "protocol": "https://",
    "domain": "localhost",
    "port": "3183",
    "path": "",
    "userFriendlyServerName": "Localhost",
    "authUrls": ["https://localhost:3182"],
    "clientUrls": [{
      "userFriendlyClientName": "Spreadsheet",
      "url": "chrome-extension://pcflbgejbbgijjbmaodhhbibegdfecjc/index.html"
    }, {
      "userFriendlyClientName": "Prototype Online",
      "url": "https://localhost:6984/" + options.dbname + "/_design/pages/corpus.html"
    }, {
      "userFriendlyClientName": "Localhost Chrome App",
      "url": "chrome-extension://kaaemcdklbfiiaihlnkmknkgbnkamcbh/user.html#corpus/" + options.dbname
    }, {
      "userFriendlyClientName": "Public Url",
      "url": "https://localhost:3182/" + options.username + "/" + options.corpusidentifier + "/" + options.dbname
    }, {
      "userFriendlyClientName": "Activity Feed",
      "url": "https://localhost:6984/" + options.dbname + "-activity_feed/_design/activity/activity_feed.html"
    }],
    "corpusUrls": ["https://localhost:6984/" + options.dbname],
    "lexiconUrls": ["https://localhost:3185/train/lexicon/" + options.dbname],
    "searchUrls": ["https://localhost:3195/search/" + options.dbname],
    "audioUrls": ["https://localhost:3184/" + options.dbname + "/utterances"],
    "activityUrls": ["https://localhost:6984/" + options.dbname + "-activity_feed"]
  };
};

CorpusConnection.prototype = Object.create(FieldDBObject.prototype, /** @lends CorpusConnection.prototype */ {

  constructor: {
    value: CorpusConnection
  },

  INTERNAL_MODELS: {
    value: {
      corpusid: FieldDBObject.DEFAULT_STRING,
      titleAsUrl: FieldDBObject.DEFAULT_STRING,
      dbname: FieldDBObject.DEFAULT_STRING,

      pouchname: FieldDBObject.DEFAULT_STRING,
      protocol: FieldDBObject.DEFAULT_STRING,
      domain: FieldDBObject.DEFAULT_STRING,
      port: FieldDBObject.DEFAULT_STRING,
      path: FieldDBObject.DEFAULT_STRING,
      userFriendlyServerName: FieldDBObject.DEFAULT_STRING,

      authUrls: FieldDBObject.DEFAULT_ARRAY,
      clientUrls: FieldDBObject.DEFAULT_ARRAY,
      corpusUrls: FieldDBObject.DEFAULT_ARRAY,
      lexiconUrls: FieldDBObject.DEFAULT_ARRAY,
      searchUrls: FieldDBObject.DEFAULT_ARRAY,
      audioUrls: FieldDBObject.DEFAULT_ARRAY,
      activityUrls: FieldDBObject.DEFAULT_ARRAY
    }
  },

  pouchname: {
    get: function() {
      return this.dbname;
    },
    set: function(value) {
      this.todo("pouchname is deprecated, use dbname instead " + value);
      this.dbname = value;
    }
  },

  dbname: {
    get: function() {
      if (this.parent && this.parent.dbname) {
        return this.parent.dbname;
      }
      return this._dbname;
    },
    set: function(value) {
      if (value === this._dbname) {
        return;
      }
      if (!value) {
        delete this._dbname;
        return;
      } else {
        if (typeof value.trim === "function") {
          value = value.trim();
          if (value !== "default") {
            var pieces = value.split("-");
            if (pieces.length !== 2) {
              throw new Error("Database names should be composed of a username-datbaseidentifier" + value);
            }
            var identifierValidationResults = CorpusConnection.validateIdentifier(pieces[1]);
            value = pieces[0] + "-" + identifierValidationResults.identifier;
            if (identifierValidationResults.changes.length > 0) {
              this.warn(" Invalid identifier ", identifierValidationResults.changes.join("\n "));
              throw new Error(identifierValidationResults.changes.join("\n "));
            }
          }
        }
      }
      this._dbname = value;

    }
  },

  owner: {
    get: function() {
      if (!this.dbname) {
        return;
      }
      var pieces = this.dbname.split("-");
      if (pieces.length !== 2) {
        throw new Error("Database names should be composed of a username-datbaseidentifier" + this.dbname);
      }
      var username = pieces[0];
      return username;
    }
  },

  gravatar: {
    get: function() {
      if (this.parent && this.parent.team) {
        if (this.parent.team.gravatar) {
          this._gravatar = this.parent.team.gravatar;
        } else {
          this._gravatar = this.parent.team.buildGravatar(this.dbname);
        }
      }
      return this._gravatar;
    },
    set: function(value) {
      if (value === this._gravatar) {
        return;
      }
      if (!value) {
        delete this._gravatar;
        return;
      } else {
        if (typeof value.trim === "function") {
          value = value.trim();
        }
      }
      this._gravatar = value;
    }
  },

  title: {
    get: function() {
      if (this.parent) {
        this._title = this.parent.title;
      }

      if (!this._title && this.dbname) {
        var pieces = this.dbname.split("-");
        if (this.dbname !== "default" && pieces.length !== 2) {
          throw new Error("Database names should be composed of a username-datbaseidentifier" + this.dbname);
        }
        pieces.shift();
        var corpusidentifier = pieces.join("-");
        this._title = corpusidentifier;
      }
      return this._title;
    },
    set: function(value) {
      if (value === this._title) {
        return;
      }
      if (!value) {
        delete this._title;
        return;
      } else {
        if (typeof value.trim === "function") {
          value = value.trim();
        }
      }
      this._title = value;
    }
  },

  titleAsUrl: {
    get: function() {
      if (this.parent && this.parent.titleAsUrl) {
        this._titleAsUrl = this.parent.titleAsUrl;
      }

      if (!this._titleAsUrl) {
        if (this.title) {
          this._titleAsUrl = this.sanitizeStringForFileSystem(this.title, "_").toLowerCase();
        }
      }
      return this._titleAsUrl;
    },
    set: function(value) {
      if (value === this._titleAsUrl) {
        return;
      }
      if (!value) {
        delete this._titleAsUrl;
        return;
      } else {
        if (typeof value.trim === "function") {
          value = value.trim();
        }
      }
      this._titleAsUrl = value;
    }
  },

  authUrl: {
    get: function() {
      if (this.authUrls && this.authUrls[0]) {
        return this.authUrls[0];
      }
      return "";
    },
    set: function(value) {
      if (this.authUrls && value === this.authUrls[0]) {
        return;
      }
      if (!value) {
        return;
      } else {
        if (typeof value.trim === "function") {
          value = value.trim();
        }
        value = value.replace(/[^.\/]*.fieldlinguist.com:3183/g, "auth.lingsync.org");
      }

      if (!this.authUrls) {
        this.authUrls = [value];
      } else if (this.authUrls.length === 0) {
        this.authUrls.unshift(value);
      } else {
        var alreadyKnown = this.authUrls.indexOf(value);
        if (alreadyKnown > -1) {
          this.authUrls.splice(alreadyKnown, 1);
        }
        this.authUrls.unshift(value);
      }

    }
  },

  domain: {
    get: function() {
      return this._domain || "";
    },
    set: function(value) {
      if (value === this._domain) {
        return;
      }
      if (!value) {
        delete this._domain;
        return;
      } else {
        if (typeof value.trim === "function") {
          value = value.trim();
          value = value.replace(/ifielddevs.iriscouch.com/g, "corpus.lingsync.org");
        }
      }
      this._domain = value;
    }
  },

  corpusUrl: {
    get: function() {
      if (this.corpusUrls && this.corpusUrls[0]) {
        return this.corpusUrls[0];
      }

      if (!this.domain || !this.dbname) {
        return "";
      }

      var couchurl = this.protocol + this.domain;
      if (this.port && this.port !== "443" && this.port !== "80") {
        couchurl = couchurl + ":" + this.port;
      }
      var path = this.path || "";
      if (path) {
        path = "/" + path;
      }
      couchurl = couchurl + path;
      couchurl = couchurl + "/" + this.dbname;
      couchurl = couchurl.replace("http://localhost:5984", "https://localhost:6984");
      /*
       * For debugging cors #838: Switch to use the corsproxy corpus service instead
       * of couchdb directly
       */
      // couchurl = couchurl.replace(/https/g,"http").replace(/6984/g,"3186");
      this.corpusUrls = [couchurl];
      return couchurl;
    },
    set: function(value) {
      if (this.corpusUrls && value === this.corpusUrls[0]) {
        return;
      }
      if (!value) {
        return;
      } else {
        if (typeof value.trim === "function") {
          value = value.trim();
          value = value.replace("http://localhost:5984", "https://localhost:6984");
        }
      }

      if (!this.corpusUrls) {
        this.corpusUrls = [value];
      } else if (this.corpusUrls.length === 0) {
        this.corpusUrls.unshift(value);
      } else {
        var alreadyKnown = this.corpusUrls.indexOf(value);
        if (alreadyKnown > -1) {
          this.corpusUrls.splice(alreadyKnown, 1);
        }
        this.corpusUrls.unshift(value);
      }
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);
      includeEvenEmptyAttributes = true;
      this.debug(" forcing corpusUrls to be defined ", this.corpusUrl);
      var json = FieldDBObject.prototype.toJSON.apply(this, arguments);

      delete json.dateCreated;
      delete json.dateModified;

      // TODO eventually dont include the label and hint but now include it for backward compaitibilty
      json.pouchname = json.dbname = this.dbname || "";
      json.title = this.title || json.dbname;
      json.titleAsUrl = this.titleAsUrl || json.dbname;

      json.fieldDBtype = this.fieldDBtype;
      delete json._type;

      this.debug(json);
      return json;
    }
  }

});


/*
 * This function is the same in all webservicesconfig, now any couchapp can
 * login to any server, and register on the corpus server which matches its
 * origin.
 */
CorpusConnection.defaultCouchConnection = function(optionalHREF, OptionalURLParser) {
  var localhost = {
    protocol: "https://",
    domain: "localhost",
    port: "6984",
    pouchname: "default",
    path: "",
    serverLabel: "localhost",
    authUrls: ["https://localhost:3183"],
    // corpusUrls: ["https://localhost:6984"],
    userFriendlyServerName: "Localhost"
  };
  var beta = {
    protocol: "https://",
    domain: "corpusdev.lingsync.org",
    port: "443",
    pouchname: "default",
    path: "",
    serverLabel: "beta",
    authUrls: ["https://authdev.lingsync.org"],
    // corpusUrls: ["https://corpusdev.lingsync.org"],
    userFriendlyServerName: "LingSync Beta"
  };
  var production = {
    protocol: "https://",
    domain: "corpus.lingsync.org",
    port: "443",
    pouchname: "default",
    path: "",
    serverLabel: "production",
    authUrls: ["https://auth.lingsync.org"],
    // corpusUrls: ["https://corpus.lingsync.org"],
    userFriendlyServerName: "LingSync.org"
  };
  //v1.90 all users are on production
  // beta = production;

  var mcgill = {
    protocol: "https://",
    domain: "corpus.lingsync.org",
    port: "443",
    pouchname: "default",
    path: "",
    serverLabel: "mcgill",
    authUrls: ["https://auth.lingsync.org"],
    // corpusUrls: ["https://corpus.lingsync.org"],
    userFriendlyServerName: "McGill ProsodyLab"
  };

  var concordia = {
    protocol: "https://",
    domain: "corpus.lingsync.org",
    port: "443",
    pouchname: "default",
    path: "",
    serverLabel: "concordia",
    authUrls: ["https://auth.lingsync.org"],
    // corpusUrls: ["https://corpus.lingsync.org"],
    userFriendlyServerName: "Concordia Linguistics"
  };

  /*
   * If its a couch app, it can only contact databases on its same origin, so
   * modify the domain to be that origin. the chrome extension can contact any
   * authorized server that is authorized in the chrome app's manifest
   */
  var connection;

  if (!optionalHREF) {
    try {
      if (window && window.location) {
        optionalHREF = window.location.href;
      } else {
        connection = localhost;
        optionalHREF = connection.authUrls[0];
      }
    } catch (e) {
      connection = localhost;
      optionalHREF = connection.authUrls[0];
    }
  }

  if (optionalHREF.indexOf("_design/pages") > -1) {
    if (optionalHREF.indexOf("corpusdev.lingsync.org") >= 0) {
      connection = beta;
    } else if (optionalHREF.indexOf("lingsync.org") >= 0) {
      connection = production;
    } else if (optionalHREF.indexOf("prosody.linguistics.mcgill") >= 0) {
      connection = mcgill;
    } else if (optionalHREF.indexOf("localhost") >= 0) {
      connection = localhost;
    }
  } else {
    if (optionalHREF.indexOf("jlbnogfhkigoniojfngfcglhphldldgi") >= 0) {
      connection = mcgill;
    } else if (optionalHREF.indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
      connection = beta;
    } else if (optionalHREF.indexOf("ocmdknddgpmjngkhcbcofoogkommjfoj") >= 0) {
      connection = production;
    } else if (optionalHREF.indexOf("dev.lingsync.org") >= 0) {
      connection = beta;
    } else if (optionalHREF.indexOf("lingsync.org") >= 0) {
      connection = production;
    } else if (optionalHREF.indexOf("prosody.linguistics.mcgill") >= 0) {
      connection = mcgill;
    } else if (optionalHREF.indexOf("linguistics.concordia") >= 0) {
      connection = concordia;
    } else if (optionalHREF.indexOf("lingsync") >= 0) {
      connection = production;
    } else if (optionalHREF.indexOf("localhost") >= 0) {
      connection = localhost;
    }
  }
  if (!connection) {

    console.warn("The user is trying to use a server which is unknown to the system. Attempting to construct its connection. ", optionalHREF);
    var connectionUrlObject;
    try {
      OptionalURLParser = OptionalURLParser || URL;
    } catch (e) {
      console.log("Cant figure out what the URL parser is");
      try {
        OptionalURLParser = require("url");
      } catch (e) {
        console.log("wasnt able to require URL either, this wont work.");
        OptionalURLParser = {
          parse: function(url) {
            return {};
          }
        };
      }
    }
    try {
      connectionUrlObject = new OptionalURLParser(optionalHREF);
    } catch (e) {
      console.warn("Cant use new OptionalURLParser() in this environment.", e);
      connectionUrlObject = OptionalURLParser.parse(optionalHREF);
      // console.log(connectionUrlObject);
    }
    if (!connectionUrlObject || !connectionUrlObject.hostname) {
      console.warn("There was no way to deduce the HREF, probably we are in Node. Using localhost instead. ", optionalHREF);
      connection = localhost;
    } else {
      var domainName = connectionUrlObject.hostname.split(".");
      while (domainName.length > 2) {
        domainName.shift();
      }
      domainName = domainName.join(".");
      connection = {
        protocol: connectionUrlObject.protocol + "//",
        domain: connectionUrlObject.hostname,
        port: connectionUrlObject.port,
        pouchname: "default",
        path: connectionUrlObject.pathname.replace("/", ""),
        serverLabel: domainName.substring(0, domainName.lastIndexOf(".")),
        authUrls: [optionalHREF],
        userFriendlyServerName: domainName
      };
    }
  }
  connection = new CorpusConnection(connection).toJSON();
  return connection;
};

/**
 * Ensures that dbnames can be used inside of corpus identifiers, which are couchdb database names.
 *
 * @param  {string} originalIdentifier the desired dbname or username
 * @return {object}                  the resulting dbname or username, the original dbname, and the changes that were applied.
 */
CorpusConnection.validateIdentifier = function(originalIdentifier) {
  var identifier = originalIdentifier.toString();
  var changes = [];
  if (identifier.toLowerCase() !== identifier) {
    changes.push("The identifier has to be lowercase so that it can be used in your CouchDB database names.");
    identifier = identifier.toLowerCase();
  }

  if (identifier.split("-").length > 1) {
    changes.push("We are using - as a reserved symbol in database names, so you can't use it in your identifier.");
    identifier = identifier.replace("-", ":::").replace(/-/g, "_").replace(":::", "-");
  }

  if (Diacritics.clean(identifier) !== identifier) {
    changes.push("You have to use ascii characters in your identifiers because your identifier is used in your in web urls, so its better if you can use something more web friendly.");
    identifier = Diacritics.clean(identifier);
  }

  if (identifier.replace(/[^a-z0-9_-]/g, "_") !== identifier) {
    changes.push("You have some characters which web servers wouldn't trust in your identifier.");
    identifier = identifier.replace(/[^a-z0-9_]/g, "_");
  }

  if (identifier.length < 2) {
    changes.push("Your identifier is really too short.");
  }

  if (changes.length > 0) {
    changes.unshift("You asked to use " + originalIdentifier + " but we would reccomend using this instead: " + identifier + " the following are a list of reason's why.");
  }

  return {
    "identifier": identifier,
    "original": originalIdentifier,
    "changes": changes
  };
};



/**
 * This is the base schema of a corpus connection, other fields may be added.
 * This schema is used by the API docs, it should be updated as the above newCorpusConnection changes.
 *
 * @type {Object}
 */
CorpusConnection.baseSchema = {
  "id": "CouchConnection",
  "properties": {
    "corpusid": {
      "type": "string"
    },
    "dbname": {
      "type": "string"
    },
    "pouchname": {
      "type": "string"
    },
    "protocol": {
      "type": "string"
    },
    "domain": {
      "type": "string"
    },
    "port": {
      "type": "string"
    },
    "path": {
      "type": "string"
    },
    "authUrl": {
      "items": {
        "$ref": "string"
      },
      "type": "Array"
    },
    "clientUrls": {
      "items": {
        "$ref": "ClientApp"
      },
      "type": "Array"
    },
    "corpusUrls": {
      "items": {
        "$ref": "string"
      },
      "type": "Array"
    },
    "lexiconUrls": {
      "items": {
        "$ref": "string"
      },
      "type": "Array"
    },
    "searchUrls": {
      "items": {
        "$ref": "string"
      },
      "type": "Array"
    },
    "audioUrls": {
      "items": {
        "$ref": "string"
      },
      "type": "Array"
    }
  }
};


exports.CorpusConnection = CorpusConnection;
