/* globals  window, FieldDB */
'use strict';

console.log("Declaring the Server config.");

// turn off todos and verbose messages
FieldDB.FieldDBObject.todo = function() {};
FieldDB.FieldDBObject.verbose = function() {};
// turn off warnings when on a production site
FieldDB.FieldDBObject.warn = function(message, message2, message3, message4) {
  if (window.location.href.indexOf("localhost") > -1) {
    // return;
  }
  if (window.location.href.indexOf("example") > -1) {
    return;
  }
  var type = this.fieldDBtype || this._id || "UNKNOWNTYPE";
  // putting out a stacktrace
  console.error(type.toUpperCase() + " WARN: " + message);
  if (message2) {
    console.warn(message2);
  }
  if (message3) {
    console.warn(message3);
  }
  if (message4) {
    console.warn(message4);
  }
};

document.addEventListener("appready", function() {

  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {

    FieldDB.FieldDBObject.application.brand = "Example";
    FieldDB.FieldDBObject.application.brandLowerCase = "example";
    FieldDB.FieldDBObject.application.website = "http://example.org";
    FieldDB.FieldDBObject.application.faq = "http://app.example.org/#/faq";

    if (FieldDB.FieldDBObject.application.connections && FieldDB.FieldDBObject.application.connections && FieldDB.FieldDBObject.application.connections.length > 0) {
      return;
    }
    FieldDB.FieldDBObject.application.connections = new FieldDB.Corpora({
      primaryKey: "serverLabel"
    });

    if (window.location.host.indexOf("localhost") > -1) {
      FieldDB.FieldDBObject.application.connections.add(FieldDB.Connection.defaultConnection("localhost"));
    }
    FieldDB.FieldDBObject.application.connections.add(FieldDB.Connection.defaultConnection("example"));
    // FieldDB.FieldDBObject.application.connections.Example_Beta = FieldDB.Connection.defaultConnection();
    FieldDB.FieldDBObject.application.connection = FieldDB.FieldDBObject.application.connections._collection[0];

  } else {
    console.warn("FieldDB library is not available. the application won't behave normally. Please notify us.");
    try {
      window.setTimeout(function() {
        window.open("https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform");
      }, 1500);
    } catch (e) {
      console.log(e);
    }
  }

}, false);
