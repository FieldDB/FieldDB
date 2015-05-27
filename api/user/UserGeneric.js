/**
 * @lends UserGeneric.prototype
 *
 * @class A generic user has a repository and permission groups
 *        (read, write, admin). It can not login.
 *
 *
 * @description Contains basic functions to manipulate User json and schema,
 * can be used as a shared model between clients and servers.
 * Uses dependancy injection for classes it depends on.
 *
 * @param {Hotkeys} Hotkeys               [description]
 * @param {UserPreference} UserPreference [description]
 *
 * @property {String} username This is a username used when login.
 * @property {String} password This is a password used when login. It should be secure (containing 1 digit, 1 uppercase) because it is what protects the confidentiality of the corpus.
 * @property {String} email This is user's email
 * @property {String} gravatar This is user's gravatar
 * @property {String} researchInterest This is user's field of
 *           interest (eg. semantics etc)
 * @property {String} affiliation This is user's affiliation
 * @property {String} description This user's description
 * @property {String} subtitle This user's subtitle
 * @property {Array} corpora The corpus connections of the corpora owned by
 *           this user
 * @property {Array} dataLists The datalist IDs of the datalists owned
 *           by this user.
 * @property {UserPreference} prefs This is where we"ll have things like
 *           background/skin.
 *
 * @description The initialize function probably checks to see if
 *              the user is existing or new and creates a new
 *              account if it is new.
 *
 * @extends Object
 *
 */
var UserGenericFactory = function(appVersion, defaultConnection, Diacritics, HotKeys, MD5, UserPreference) {
  if (!appVersion || !defaultConnection) {
    throw new Error("You must supply an appVersion and a defaultConnection which will be used to create new users");
  }

  this.appVersion = appVersion;
  this.defaultConnection = defaultConnection;

  /* TODO move these to seperate files as they are created */
  if (!HotKeys) {
    HotKeys = {};
  }
  if (!Diacritics) {
    Diacritics = {
      "remove": function(input) {
        return input;
      }
    };
  }
  if (!UserPreference) {
    UserPreference = {
      create: function() {
        return {
          "skin": "user/skins/llama_wool.jpg",
          "numVisibleDatum": 2,
          "transparentDashboard": "false",
          "alwaysRandomizeSkin": "false",
          "preferredDashboardLayout": "default",
          "preferredClientApps": ["spreadsheet"],
          "numberOfItemsInPaginatedViews": 10,
          "unicodes": [{
            "symbol": "ɔ",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "ə",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "ɛ",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "ɣ",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "ɥ",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "ɦ",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "ɫ",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "ʃ",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "ʒ",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "ʔ",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "λ ",
            "tipa": "lambda",
            "useCount": 0
          }, {
            "symbol": "α ",
            "tipa": "alpha",
            "useCount": 0
          }, {
            "symbol": "β ",
            "tipa": "\beta",
            "useCount": 0
          }, {
            "symbol": "∀",
            "tipa": "\forall",
            "useCount": 0
          }, {
            "symbol": "∃",
            "tipa": "exists",
            "useCount": 0
          }, {
            "symbol": "°",
            "tipa": "^{circ}",
            "useCount": 0
          }, {
            "symbol": "∄",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "∅",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "∈",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "∉",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "∋",
            "tipa": "",
            "useCount": 0
          }, {
            "symbol": "∌",
            "tipa": "",
            "useCount": 0
          }]
        };
      }
    };
  }

  // Internal models: used by the parse function
  this.internalModels = {
    prefs: UserPreference,
    hotkeys: HotKeys
  };

  /**
   * Ensures that usernames can be used inside of corpus identifiers, which are couchdb database names.
   *
   * @param  {string} originalUsername the desired username
   * @return {object}                  the resulting username, the original username, and the changes that were applied.
   */
  this.validateUsernameFormat = function(originalUsername) {
    var username = originalUsername.toString();
    var changes = [];
    if (username.toLowerCase() !== username) {
      changes.push("The username has to be lowercase so that it can be used in your CouchDB database names.");
      username = username.toLowerCase();
    }

    if (username.replace(/-/g, "_") !== username) {
      changes.push("We are using - as a reserved symbol in database names, so you can\"t use it in your username.");
      username = username.replace(/-/g, "_");
    }

    if (Diacritics.remove(username) !== username) {
      changes.push("You have to use ascii characters in your usernames because your username is used in your in web urls, so its better if you can use something more web friendly.");
      username = Diacritics.remove(username);
    }

    if (username.replace(/[^a-z0-9_]/g, "_") !== username) {
      changes.push("You have some characters which web servers wouldn\"t trust in your username.");
      username = username.replace(/[^a-z0-9_]/g, "_");
    }

    if (username.length < 3) {
      changes.push("Your username is really too short");
    }

    if (changes.length > 0) {
      changes.unshift("You asked to use " + originalUsername + " but that isn\"t a very url friendly username, we would reccomend using this instead: " + username);
    }

    return {
      "username": username,
      "original": originalUsername,
      "changes": changes
    };
  };

  this.addCorpusToUser = function(corpus) {
    this.corpora.unshift(corpus);
  };

  this.save = function(user) {
    console.log(JSON.stringify(user, null, 2));
  };

  this.getGravatar = function(optionalEmail) {
    var existingGravatar = this.gravatar;
    if (existingGravatar.indexOf("gravatar.com") > -1) {
      existingGravatar = existingGravatar.replace("https://secure.gravatar.com/avatar/", "");
      this.gravatar = existingGravatar;
      return existingGravatar;
    }
    if (optionalEmail) {
      var hash = MD5(optionalEmail).toString();
      this.set("gravatar", hash);
      return hash;
    }
    if (existingGravatar.indexOf("/") > -1) {
      existingGravatar = existingGravatar.replace(/\//g, "").replace("userpublic_gravatar.png", "968b8e7fb72b5ffe2915256c28a9414c");
    }
    return existingGravatar;
  };


  this.setMostRecentIds = function(user, mostRecentIds) {
    user.mostRecentIds = mostRecentIds;
  };

  this.getMostRecentIds = function() {
    return {
      "corpusid": "",
      "datalistid": "",
      "sessionid": "",
      "connection": {
        "protocol": "",
        "domain": "",
        "port": "",
        "dbname": "",
        "pouchname": "",
        "path": "",
        "authUrls": "",
        "userFriendlyServerName": "",
        "corpusid": ""
      }
    };
  };

  this.build = function(optionalRequestedUserDetails, optionalRequestedConnection) {
    console.log("Creating user with ", optionalRequestedUserDetails);

    if (!optionalRequestedUserDetails || !optionalRequestedUserDetails.username) {
      throw new Error("Please provide username and other details to create this user");
    }
    var userNameValidationResults = this.validateUsernameFormat(optionalRequestedUserDetails.username);
    optionalRequestedUserDetails.username = userNameValidationResults.username;

    if (userNameValidationResults.changes.length > 0) {
      throw new Error(userNameValidationResults.changes.join("\n "));
    }
    var usersConnection = optionalRequestedConnection;
    if (!usersConnection) {
      usersConnection = JSON.parse(JSON.stringify(this.defaultConnection));
    }
    console.log("Corpus connection ", JSON.stringify(usersConnection, null, 2));

    return {
      "_id": optionalRequestedUserDetails.username,
      "username": optionalRequestedUserDetails.username,
      "jsonType": "user",
      "salt": optionalRequestedUserDetails.salt || "",
      "hash": optionalRequestedUserDetails.hash || "",
      "email": optionalRequestedUserDetails.email || "",
      "gravatar": optionalRequestedUserDetails.gravatar || "",
      "appVersionWhenCreated": this.appVersion,
      "created_at": Date.now(),
      "updated_at": Date.now(),
      "researchInterest": optionalRequestedUserDetails.researchInterest || "",
      "affiliation": optionalRequestedUserDetails.affiliation || "",
      "description": optionalRequestedUserDetails.description || "",
      "subtitle": optionalRequestedUserDetails.subtitle || "",
      "firstname": optionalRequestedUserDetails.firstname || "",
      "lastname": optionalRequestedUserDetails.lastname || "",
      "corpora": [{
        "corpusid": "TBA",
        "pouchname": optionalRequestedUserDetails.username + "-firstcorpus",
        "dbname": optionalRequestedUserDetails.username + "-firstcorpus",

        "protocol": usersConnection.protocol,
        "domain": usersConnection.domain,
        "port": usersConnection.port,
        "path": usersConnection.path,

        "userFriendlyServerName": usersConnection.userFriendlyServerName,
        "authUrls": usersConnection.authUrls,
        "clientUrls": usersConnection.clientUrls,
        "corpusUrls": usersConnection.corpusUrls,
        "lexiconUrls": usersConnection.lexiconUrls,
        "searchUrls": usersConnection.searchUrls,
        "audioUrls": usersConnection.audioUrls
      }],
      "activityConnection": {
        "pouchname": optionalRequestedUserDetails.username + "-activity_feed",
        "dbname": optionalRequestedUserDetails.username + "-activity_feed",

        "protocol": usersConnection.protocol,
        "domain": usersConnection.domain,
        "port": usersConnection.port,
        "path": usersConnection.path,

        "userFriendlyServerName": usersConnection.userFriendlyServerName,
        "activityUrls": usersConnection.activityUrls,
      },
      "recentDataLists": [],
      "recentSessions": [],
      "authUrls": optionalRequestedUserDetails.authUrls || "default",
      "mostRecentIds": this.getMostRecentIds(),
      "newCorpora": [],
      "hotkeys": [],
      "prefs": UserPreference.create(),
      "serverlogs": {
        "successfulLogins": [],
        "incorrectPasswordAttempts": [],
        "incorrectPasswordEmailSentCount": 0
      }
    };
  };

  this.baseSchema = {
    "id": "User",
    "properties": {
      "_id": {
        "type": "string",
        "description": "Must match the username",
        "required": true
      },
      "username": {
        "type": "string",
        "description": "Unfortunatly, usernames must be safe to use in web urls, filenames and CouchDB database names. Here is an example that fails everything, and how the api will automatically fix it: <pre>" + this.validateUsernameFormat("Happy-çad.uSernâmë").changes.join("\n") + "</pre>",
        "required": true
      },
      "gravatar": {
        "type": "string",
        "required": true,
        "description": "if string is not provided, but an email is provded, the gravatar will be automatically generated from the email"
      },
      "jsonType": {
        "type": "string",
        "description": "automatically set to 'user'"
      },
      "subtitle": {
        "type": "string",
        "description": "If not empty, this can be used to replace firstname lastname on a user's profile page. Example: 'The Schmoe of joe-schmoes'"
      },
      "firstname": {
        "type": "string"
      },
      "lastname": {
        "type": "string"
      },
      "affiliation": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "researchInterest": {
        "type": "string"
      },
      "email": {
        "type": "email",
        "description": "Emails aren\"t actually required. If the user does provide an email at registration, is used to automaticaly link up their gravatar and send them a welcome email so that they know that they registered (in case they forget their username later). It\"s not used for any other purpose. Why are emails not required? Many academics who would use the service, claim that they don\"t like to share their emails. In practice, almost all the users who have signed up, did provide an email. If the user doesn\"t provide an email, what do they loose? They will have no way of resetting their password, they won\"t recieve a registration email, and they won\"t really have any way of proving who they are if they want to delete their corpus, or request their private data etc. While not requiring an email is not a good idea, we have other ways of identifying bogus accounts and leave whether they provide an email up to the user."
      },
      "corpora": {
        "items": {
          "$ref": "Connection"
        },
        "type": "Array",
        "description": "A user can own or have access to any number of corpora. If the user has access to a corpus, it is generally storred in an array called corpora in their user details. This array can be updated at any time by calling get user corpora API. Example: <pre>" + JSON.stringify([{
          "corpusid": "89bc4d7dcc2b1fc9a7bb0f4f4743e705",
          "pouchname": "lingllama-communitycorpus",
          "dbname": "lingllama-communitycorpus",
          "protocol": "https://",
          "domain": "corpusdev.fielddb.org",
          "port": "",
          "path": "",
          "authUrls": ["https://authdev.fielddb.org", "https://auth.fielddb.org"],
          "clientUrls": [{
            "userFriendlyClientName": "Spreadsheet",
            "url": "http://spreadsheet.fielddb.org"
          }, {
            "userFriendlyClientName": "Prototype Online",
            "url": "https://corpusdev.fielddb.org/lingllama-communitycorpus/_design/pages/corpus.html"
          }, {
            "userFriendlyClientName": "Beta Chrome App",
            "url": "chrome-extension://eeipnabdeimobhlkfaiohienhibfcfpa/user.html#corpus/lingllama-communitycorpus"
          }, {
            "userFriendlyClientName": "Prototype Chrome App",
            "url": "chrome-extension://ocmdknddgpmjngkhcbcofoogkommjfoj/user.html#corpus/lingllama-communitycorpus"
          }, {
            "userFriendlyClientName": "Public Url",
            "url": "https://wwwdev.fielddb.org/lingllama/communitycorpus/lingllama-communitycorpus"
          }],
          "corpusUrls": ["https://corpusdev.fielddb.org/lingllama-communitycorpus", "https://corpus.fielddb.org/lingllama-communitycorpus", "https://prosody.linguistics.mcgill.ca/corpus/lingllama-communitycorpus"],
          "lexiconUrls": ["https://lexicondev.fielddb.org/train/lexicon/lingllama-communitycorpus"],
          "searchUrls": ["https://lexicondev.fielddb.org/search/lingllama-communitycorpus"],
          "audioUrls": ["https://speechdev.fielddb.org/lingllama-communitycorpus/utterances"]
        }, {
          "protocol": "https://",
          "domain": "corpusdev.fielddb.org",
          "port": "443",
          "dbname": "lingllama-cherokee",
          "path": "",
          "corpusid": "958227C0-FF0E-46AC-8F7B-579330A24A95"
        }, {
          "protocol": "https://",
          "domain": "corpusdev.fielddb.org",
          "port": "443",
          "dbname": "lingllama-firstcorpus",
          "path": "",
          "corpusid": "1B6127DC-F156-4F48-B1D8-6F4EBA5848A5"
        }], null, 2) + "</pre>"

      },
      "activityConnection": {
        "type": "Connection",
        "description": "This is where the user's activities can be saved and retrieved. In general, if your client side app let\"s the user do something you should save activites in the user's couch and if its something that has to do with a corpus, and the other team members might want to be in the loop, also save a similar activity in the corpus activity feed (composed of corpusname-activity_feed). Here is an example of the user's feed: <pre>" + JSON.stringify({
          "protocol": "https://",
          "domain": "ifielddevs.iriscouch.com",
          "port": "443",
          "dbname": "lingllama-activity_feed",
          "path": ""
        }, null, 2) + "</pre>"
      },
      "appVersionWhenCreated": {
        "type": "string",
        "description": "This is a server internal code which tells when that user was first created. It can be used to test for need to update users or if they might not have features that your app requires. You can add additional similar fields in the user for your app eg: spreadsheetAppVersionWhenCreated"
      },
      "preferredServers": {
        "items": {
          "type": "string"
        },
        "type": "Array",
        "description": "<br>If empty and the user has no preferred servers, then the default at the time of user sign-up will be used (note: userFriendlyServerName is not case sensitive)",
        "allowableValues": {
          "valueType": "LIST",
          "values": [
            "Default",
            "Original",
            "Localhost",
            "Beta",
            "McGill Prosody Lab"
          ]
        }
      },
      "mostRecentIds": {
        "type": "MostRecentDashboard",
        "description": "the most recent ids of things which the user had open in their dashboard, so they can come back when the log back in, or if they login on a new client app. Example:<pre>" + JSON.stringify({
          "corpusid": "89bc4d7dcc2b1fc9a7bb0f4f4743e705",
          "datalistid": "89bc4d7dcc2b1fc9a7bb0f4f474432b4",
          "sessionid": "89bc4d7dcc2b1fc9a7bb0f4f474415e4",
          "corpusUrl": "https://corpusdev.example.org/lingllama-communitycorpus",
          "connection": {
            "protocol": "https://",
            "domain": "corpusdev.fielddb.org",
            "port": "",
            "dbname": "lingllama-communitycorpus",
            "path": "",
            "corpusid": "89bc4d7dcc2b1fc9a7bb0f4f4743e705"
          }
        }, null, 2) + "</pre>"
      },
      "salt": {
        "type": "string",
        "required": true,
        "description": "used by the server to authenticate the user if they are using password authentication, private fields"
      },
      "hash": {
        "type": "string",
        "required": true,
        "description": "used by the server to authenticate the user if they are using password authentication, private fields"
      },
      "created_at": {
        "type": "timestamp",
        "required": true,
        "description": "Client side apps cannot modify the user created date, if they attempt to add information it will be discarded."
      },
      "updated_at": {
        "type": "timestamp",
        "description": "This is the last time the users details were updated (ie login) server side. This doesn\"t mean the last time the user used the app since they can be pretty active offline too, and most of their activity is client side not server side. To find out about recent activity you can query their activity feed instead. <br/>Client side apps cannot modify the user updated date, if they attempt to add information it will be discarded.",
        "required": true
      },
      "newCorpora": {
        "items": {
          "$ref": "Connection"
        },
        "type": "Array",
        "description": "deprecated, was used by the client apps to add new corpora to the users details, now use the user corpora API"

      },
      "hotkeys": {
        "items": {
          "$ref": "HotKeys"
        },
        "type": "Array",
        "description": "Hot keys which the user has programmed or specified which they would like to have availiable in their client side apps. If there is a conflict with the client\"t side app\"s own hotkeys, these hotkeys should be repsected. Client side apps can had more hotkeys in here if they would like."
      },
      "prefs": {
        "type": "UserPreference",
        "description": "A collection of preferences which client side apps can use to make the user feel at home, or let them customize their user interface or user experience. Example: <pre>" + JSON.stringify(UserPreference.create(), null, 2) + "</pre>"
      },
      "recentDataLists": {
        "items": {
          "$ref": "dbname/Datalist._id"
        },
        "type": "Array",
        "description": "An array of recent datalists (top is most recent) in case a client app wants to present the user with their recent datalists that they have looked at, rather than an order based on last updated datalists in the corpus the user is looking at. Example <pre>" + JSON.stringify([
          "lingllama-communitycorpus/89bc4d7dcc2b1fc9a7bb0f4f474432b4",
          "lingllama-cherokee/A081417B-5142-44A2-8E54-3CCAF84FAFE1",
          "lingllama-cherokee/AF3460D6-D654-4969-8701-E78FC0BB8301",
          "lingllama-cherokee/C850F788-553B-4098-9F51-4402D3FAEDA5",
          "lingllama-firstcorpus/2472B1B5-F3D1-4F5D-8414-BB6E8D8F8080",
          "lingllama-firstcorpus/16953D35-7875-402E-B163-1FCE6F5A431D",
          "lingllama-firstcorpus/73C70044-A4E5-4523-AD4D-B4E5C5D5A92B",
          "lingllama-firstcorpus/1583E621-2A23-4CAD-A1C8-36A8E2E7EB92"
        ], null, 2) + "</pre>"
      },
      "recentSessions": {
        "items": {
          "$ref": "dbname/Session.id"
        },
        "type": "Array",
        "description": "An array of recent elicitation sessions (top is most recent) in case a client app wants to present the user with their recent sessions that they have looked at, rather than an order based on last updated sessions in the corpus the user is looking at. Example <pre>" + JSON.stringify([
          "lingllama-communitycorpus/89bc4d7dcc2b1fc9a7bb0f4f474415e4",
          "lingllama-cherokee/F5A8557C-E1CC-4C73-8A78-F4B7A2BCB211",
          "lingllama-cherokee/0A5E8D12-C308-4284-8912-C2B4C61502B6",
          "lingllama-firstcorpus/F6E4ABF2-1818-44C8-A984-21E07B37B86D",
          "lingllama-firstcorpus/326E3A6A-7273-44BF-ACEE-F3D8B934722E"
        ], null, 2) + "</pre>"
      },
      "serverlogs": {
        "type": "Object",
        "required": true,
        "description": "This is a server side field which is used to make sure that the user is okay, their account is not being attacked/hacked etc. Their logins contain the timestamp of login, the refering url where they logged in and what ip address they used to detect odd movement. However, field workers often use multiple computers in multiple countries so this is taken with a grain of salt. <br/>Client side apps do not have access to this information, if they attempt to add the information it will be discarded. Example:<pre>" + JSON.stringify({
          "successfulLogins": [],
          "incorrectPasswordAttempts": [],
          "incorrectPasswordEmailSentCount": 0,
        }, null, 2) + "</pre>"
      },
      "any_number_of_additional_fields": {
        "type": "ANY",
        "description": "The above are just a basic list of user attributes which can be optionally supported/used by client side apps. Client side apps can add number of additional fields, at any time to users (whether it be when the user is registered or later in the life of the user)."
      }
    }
  };

  this.set = function(user, additionalOptions, optionalRequestedConnection) {
    if (!user) {
      user = this.build(additionalOptions, optionalRequestedConnection);
    }
    for (var option in additionalOptions) {
      user[option] = additionalOptions[option];
    }
    return user;
  };


};

module.exports = UserGenericFactory;
