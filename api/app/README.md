# App

Apps are very complex objects which can keep track of state you would want in an app. It can be serialized to a database or localstoraage so the user can pick up where they left off (to keep the serialized app lightweight when an app is serialized it keeps track of the id of its internal data, not the full data itself). 

PsycholinguisticsApps can have more than one corpus, where the main corpus is where data is saved and there is a `stimuliCorpus` which contains the stimuli. 

The AppRouter knows how to take in a url and/or route params and load a specific corpus, datum, session, datalist, search result, import dashboard, user profile etc.



## Demos which you can break point

* [Psycholinguistics Dashboard](http://app.phophlo.ca) [code](https://github.com/ProjetDeRechercheSurLecriture/DyslexDisorthGame/tree/master/angular_client) in progress


## Videos

Elise's first screencast shows what is on your dashboard (basically in your app). Here is Elise interacting with her dashboard at 00:12.

https://youtu.be/iQ9hWsh1y4Y?t=12s

## Usage

You can use Apps via the `fielddb` bower package.

```bash
$ bower install fielddb --save
```
In which case all examples below would be prefixed with FieldDB
eg `FieldDB.App` or `FieldDB.AppRouter`.


You can use Apps via browserify and/or node.js

```bash
$ npm install fielddb --save
```

```javascript
var App = require("fielddb/api/app/App").App;
var AppRouter = require("fielddb/api/app/AppRouter").AppRouter;

```

## Examples


Create an App:

If you pass no parameters the app will assume you want to connect to a local server. (CouchDB is used as the corpus server under SSL at https://localhost:6984, Node.js is used for the authentication server at https://localhost:3183);

```javascript
var app = new FieldDB.App();

```


Create an App:

Below is a more realistic example which does some configuration.

```javascript
var app = new FieldDB.App({
  // debugMode: true
});
var processingPromise = app.processRouteParams({
  team: "nottestinguserexistsonlyrouteparams",
  corpusidentifier: "firstcorpus",
  importType: "participants"
});

console.log(" I gonna load this corpus for you based on the route params. " +app.corpus);
```

```javascript
var app = new FieldDB.App({
  authentication: {
    user: new FieldDB.User({
      authenticated: false
    })
  },
  contextualizer: new FieldDB.Contextualizer().loadDefaults(),
  online: true,
  brand: "Example",
  brandLowerCase: "example",
  website: "http://example.org",
  faq: "http://app.example.org/#/faq",
  // basePathname: window.location.origin + "/#",
  basePathname: "/"
});

// Declare what other urls the user can open
app.whiteListCORS = app.whiteListCORS.concat([
  "https://youtube.com/**",
  "https://youtu.be/**",
  "https://soundcloud.com/**",
  "http://fielddb.github.io/**",
  "http://*.example.org/**",
  "https://*.example.org/**",
  "https://localhost:3184/**",
  "https://localhost/**"
]);

// Set up the known server connections, and the current connection
app.knownConnections = new FieldDB.Corpora(FieldDB.Connection.knownConnections);
app.knownConnections.primaryKey = "userFriendlyServerName";
if (FieldDB.Database.prototype.BASE_AUTH_URL !== "https://localhost:3183") {
  app.connection = new FieldDB.Connection(FieldDB.Connection.defaultConnection(FieldDB.Database.prototype.BASE_AUTH_URL, "passByReference"));
} else {
  app.connection = new FieldDB.Connection(FieldDB.Connection.defaultConnection(window.location.href, "passByReference"));
}
app.knownConnections.unshift(app.connection);
if (FieldDB.Database.prototype.BASE_DB_URL !== app.connection.corpusUrl) {
  app.connection.corpusUrl = FieldDB.Database.prototype.BASE_DB_URL;
  app.connection.userFriendlyServerName  = "Custom";
}
```

Use the app:

```javascript
// Objects in the system can access the application
var obj = new FieldDB.FieldDBObject();

console.log("The other data knows how to access the application to see who is logged in, which corpus is open etc ", obj.application, FieldDB.FieldDBObject.application);

```

Use the user:

Once you initialze an app, it will try to see if anyone is logged in and load that user for you. If no one is logged in, it does nothing. If no route params are passed and no prior state is found, it does nothing. You can wait for `authentication.resumingSessionPromise` or listen to the authentication events 

```javascript
app.authentication.resumingSessionPromise
.then(function(){
  console.log("There is a user now, you can do something maybe ", app.authentication.user);
});
```

Use the localizations:

An app has a contextualizer which is able to look in a given database, or in the app and convert strings into a user's language and in a user's context (experimenter, game participant, translator, fieldlinguist, etc). You can use this contextualizer as a filter in an Angular UI.

```javascript
var forMe = app.contextualize("locale_change_session");
console.log("This will show in the browser's language (or the user's prefered language if it was set)", forMe);
```

Use the decryption:

An app also knows how to ask the user to confirm their identity inorder to decrypt information client side if they have access to it. 

```javascript
app
.authentication
.resumingSessionPromise
.then(function(){
  var previousPartcipant = new Participant({
    fieldDBtype: "Participant",
    _id: "migm740610ea",
    _rev: "1-66d7dcf2ec5756f96705e4c190efbf7b",
    fields: [{
      _id: "lastname",
      shouldBeEncrypted: true,
      encrypted: true,
      defaultfield: true,
      encryptedValue: "confidential:VTJGc2RHVmtYMS9QTXluTC9qbHFSWTRrbVZyb0c5b1pjRDN1ZTY5Q291MD0=",
      mask: "xxxxxxx",
      value: "xxxxxxx"
    }],
    dateCreated: 1407516364440,
    version: "v2.0.1",
    dateModified: 1407516364460
  });

  // Show user a prompt asking them to confirm their identity
  app
  .enterDecryptedMode()
  .then(function() {
    console.log("After I confirm my identity I can see the data", previousPartcipant.lastname)
  });
});

```


Save an App:

Calling save on an app by default saves client side in local storage so that the next page load can pick up where the user left off.

```javascript
app.save();

```

More examples of what the app can do, or how/why to use it are show in the ["it should do x" App specifications](../../tests/app/App-spec.js).

## Tests

You can find more sample ways to use Activies, and what Activies are supposed to know how to do in the ["it should do x" App specifications](../../tests/app/App-spec.js).

To run the App test suite: 

```bash
$ jasmine-node tests/app
```

## Sample serialized model(s)


The serialization of the App is not being used (only the serialization of the user's prefs). When it is being used, there will be sample serialized data eventually: sample_data/app.json


## JsDOCS

There is also some auto generated documenation which was written when the project first began. It has some stuff but it's not particularly informative: 

http://fielddb.github.io/docs/javascript/App.html


## Related Issues

There are quite a few issues in the issue tracker which talk about apps, how they evolved, and what problems/pitfalls the current code tries to solve.

https://github.com/fielddb/fielddb/issues?utf8=✓&q=app


## Known UI 

* [Backbone.js MVC](../../backbone_client/app/)
* [Angular.js Directive](../../angular_client/modules/core/src/app/components/navbar)
