/**
 * Corpus connections by default define a set of web services which are used by that corpus,
 * generally on one server. However, over time and use the user might move their audio data to
 * different servers etc making it more conveint to provide a configuration object which by
 * convention is the same server, but can be overriden and read by any of the client apps or
 * webservices. The central authority for a users" corpus is in the user's details on the
 * user's authentication server.
 *
 * This class contains basic functions to manipulate CorpusConection json and schema,
 * can be used as a shared model between clients and servers
 *
 * @param {string} appVersion				version of the app when this was used ex 0.0.0
 * @param {object} defaultCorpusConnection  optional object containing the default corpus
 *                                          connection for this client/server, if not provded, a default will be used
 */
var CorpusConnection = function(appVersion, defaultCorpusConnection, Diacritics) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "CorpusConnection";
  }

  if (!appVersion) {
    throw new Error("You must supply an appVersion and a defaultCorpusConnection which will be used to create new users");
  }
  this.appVersion = appVersion;
  this.defaultCorpusConnection = defaultCorpusConnection;

  if (!Diacritics) {
    Diacritics = {
      "remove": function(input) {
        return input;
      }
    };
  }

  /**
   * Ensures that dbnames can be used inside of corpus identifiers, which are couchdb database names.
   *
   * @param  {string} originalDbname the desired dbname
   * @return {object}                  the resulting dbname, the original dbname, and the changes that were applied.
   */
  this.validateDbnameFormat = function(originalDbname) {
    var dbname = originalDbname.toString();
    var changes = [];
    if (dbname.toLowerCase() !== dbname) {
      changes.push("The dbname has to be lowercase so that it can be used in your CouchDB database names.");
      dbname = dbname.toLowerCase();
    }

    if (dbname.split("-").length !== 2) {
      changes.push("We are using - as a reserved symbol in database names, so you can\"t use it in your dbname.");
      dbname = dbname.replace("-", ":::").replace(/-/g, "_").replace(":::", "-");
    }

    if (Diacritics.remove(dbname) !== dbname) {
      changes.push("You have to use ascii characters in your dbnames because your dbname is used in your in web urls, so its better if you can use something more web friendly.");
      dbname = Diacritics.remove(dbname);
    }

    if (dbname.replace(/[^a-z0-9_-]/g, "_") !== dbname) {
      changes.push("You have some characters which web servers wouldn\"t trust in your dbname.");
      dbname = dbname.replace(/[^a-z0-9_]/g, "_");
    }

    if (dbname.length < 4) {
      changes.push("Your dbname is really too short");
    }

    if (changes.length > 0) {
      changes.unshift("You asked to use " + originalDbname + " but that isn\"t a very url friendly dbname, we would reccomend using this instead: " + dbname);
    }

    return {
      "dbname": dbname,
      "original": originalDbname,
      "changes": changes
    };
  };


  /**
   * Used to build/validate corpus connections
   *
   * @param  {CorpusConnection} optionalRequestedCorpusConnection a object with minimally a dbname
   *
   * @param  {string} dbname                 a name space for the database also a url friendly permanent
   *                                         datbase name (composed of a username and an identifier)
   *
   * @param  {string} corpusid               a uuid of the corpus doc within the database which defines the corpus
   * @param  {string} pouchname              @deprecated use dbname instead
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
   *
   * @return {CorpusConnection}         a corpus connection based on the default at the time the module was loaded,
   *                                      and what was provided in the options parameter
   */

  this.newCorpusConnection = function(optionalRequestedCorpusConnection) {
    // console.log("Creating user with ", optionalRequestedCorpusConnection);

    if (!optionalRequestedCorpusConnection || !optionalRequestedCorpusConnection.dbname) {
      throw new Error("Please provide dbname and other details to create this connection");
    }
    var dbnameValidationResults = this.validateDbnameFormat(optionalRequestedCorpusConnection.dbname);
    optionalRequestedCorpusConnection.dbname = dbnameValidationResults.dbname;

    if (dbnameValidationResults.changes.length > 0) {
      console.log(dbnameValidationResults.changes.join("\n "));
      throw new Error(dbnameValidationResults.changes.join("\n "));
    }
    var pieces = optionalRequestedCorpusConnection.dbname.split("-");
    if (pieces.length != 2) {
      throw new Error("Database names should be composed of a username-datbaseidentifier" + optionalRequestedCorpusConnection.dbname);
    }
    var username = pieces[0];
    var databaseidentifier = pieces[1];
    return {
      "corpusid": "TBA",
      "pouchname": optionalRequestedCorpusConnection.dbname,
      "dbname": optionalRequestedCorpusConnection.dbname,
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
        "url": "https://localhost:6984/" + optionalRequestedCorpusConnection.dbname + "/_design/pages/corpus.html"
      }, {
        "userFriendlyClientName": "Localhost Chrome App",
        "url": "chrome-extension://kaaemcdklbfiiaihlnkmknkgbnkamcbh/user.html#corpus/" + optionalRequestedCorpusConnection.dbname
      }, {
        "userFriendlyClientName": "Public Url",
        "url": "https://localhost:3182/" + username + "/" + databaseidentifier + "/" + optionalRequestedCorpusConnection.dbname
      }, {
        "userFriendlyClientName": "Activity Feed",
        "url": "https://localhost:6984/" + optionalRequestedCorpusConnection.dbname + "-activity_feed/_design/activity/activity_feed.html"
      }],
      "corpusUrls": ["https://localhost:6984/" + optionalRequestedCorpusConnection.dbname],
      "lexiconUrls": ["https://localhost:3185/train/lexicon/" + optionalRequestedCorpusConnection.dbname],
      "searchUrls": ["https://localhost:3195/search/" + optionalRequestedCorpusConnection.dbname],
      "audioUrls": ["https://localhost:3184/" + optionalRequestedCorpusConnection.dbname + "/utterances"],
      "activityUrls": ["https://localhost:6984/" + optionalRequestedCorpusConnection.dbname + "-activity_feed"]
    };
  };


  this.set = function(corpusConnection, additionalOptions) {
    if (!corpusConnection) {
      corpusConnection = this.newCorpusConnection(additionalOptions);
    }
    for (var option in additionalOptions) {
      corpusConnection[option] = additionalOptions[option];
    }
    return corpusConnection;
  };
  /**
   * This is the base schema of a corpus connection, other fields may be added.
   * This schema is used by the API docs, it should be updated as the above newCorpusConnection changes.
   *
   * @type {Object}
   */
  this.baseSchema = {
    "id": "CouchConnection",
    "properties": {
      "corpusid": {
        "type": "string"
      },
      "pouchname": {
        "type": "string"
      },
      "dbname": {
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

};

module.exports = CorpusConnection;
