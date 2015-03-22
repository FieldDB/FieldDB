/* globals  window, FieldDB */
'use strict';
console.log("Declaring the Server config.");
document.addEventListener("authenticated", function() {

  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
    FieldDB.FieldDBObject.application.brand = "Example";
    FieldDB.FieldDBObject.application.brandLowerCase = "example";
    FieldDB.FieldDBObject.application.website = "http://example.org";
    FieldDB.FieldDBObject.application.faq = "http://app.example.org/#/faq";

    FieldDB.FieldDBObject.application.connections = new FieldDB.CorpusConnections({
      primaryKey: "serverlabel"
    });

    if (window.location.host.indexOf("localhost") > -1) {
      FieldDB.FieldDBObject.application.connections.add(FieldDB.CorpusConnection.defaultCouchConnection("localhost"));
    }
    FieldDB.FieldDBObject.application.connections.add(FieldDB.CorpusConnection.defaultCouchConnection("example"));
    // FieldDB.FieldDBObject.application.connections.Example_Beta = FieldDB.CorpusConnection.defaultCouchConnection();
    FieldDB.FieldDBObject.application.connection = FieldDB.FieldDBObject.application.connections.example;
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
