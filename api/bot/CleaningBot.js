/* Depends on jquery couch  */
var $ = require("jquery.couch.js");


var Bot = function(pouchname, corpusid, corpustitle) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Bot";
  }

  if (!pouchname || !corpusid || !corpustitle) {
    throw ("You must create this bot with a database name, a corpus id and a corpus title. ");
  }
  var stopAt = 10;

  var activities = $.couch.db(pouchname + "-activity_feed");
  var database = $.couch.db(pouchname);

  var name = "inuktitutcleaningbot";
  var gravatar = "968b8e7fb72b5ffe2915256c28a9414c";

  var cleaningFunction = function(datum, saveFunction) {
    if (!datum.collection || datum.collection !== "datums") {
      console.log("This isnt a datum.");
      return;
    }

    var changes = [];
    /* clean out fields that came from quechua corpus, and set the validation status to something more accurate for this corpus */
    for (var field = datum.datumFields.length - 1; field > 0; field--) {
      // console.log("field "+datum.datumFields[field].label );
      if (datum.datumFields[field].label === "notes" || datum.datumFields[field].label === "dateElicited" || datum.datumFields[field].label === "checkedWithConsultant" || datum.datumFields[field].label === "dialect ") {
        var oldField = datum.datumFields.splice(field, 1);
        console.log("Removed field " + oldField[0].label);
        changes.push("Removed " + oldField[0].label);
      }
      if (datum.datumFields[field].label === "validationStatus") {
        // console.log("validationStatus: "+ datum.datumFields[field].value);
        if (datum.datumFields[field].value.indexOf("Checked") === 0 || !datum.datumFields[field].value) {
          if (!datum.datumFields[field].value) {
            datum.datumFields[field].value = "PublishedInWrittenDocument";
          }
          datum.datumFields[field].value = datum.datumFields[field].value.replace(/^Checked/, "PublishedInWrittenDocument");
          datum.datumFields[field].value = "ToBeCheckedWithASpeakerForNaturalness, " + datum.datumFields[field].value;
          datum.datumFields[field].mask = datum.datumFields[field].value;
        } else {
          datum.datumFields[field].value = "ToBeCheckedWithASpeakerForNaturalness, PublishedInWrittenDocument, " + datum.datumFields[field].value;
          datum.datumFields[field].mask = datum.datumFields[field].value;
        }
        changes.push("Flagged as " + datum.datumFields[field].value);
      }
    }

    var timestamp = Date.now();
    /* Record this event in the comments */
    var changeDescription = changes.join(", ");
    datum.comments.push({
      "text": changeDescription,
      "username": name,
      "timestamp": timestamp,
      "gravatar": gravatar,
      "timestampModified": timestamp
    });


    if (typeof saveFunction === "function") {
      saveFunction(datum, changeDescription);
    }

  };

  var saveDocBackToCouchDB = function(cleanedDoc, directobjectMessage) {
    console.log("Here is what we would save ", cleanedDoc);

    if (true) {
      return;
    }
    (function(modifiedDoc, oldrev, directobject) {

      database.saveDoc(modifiedDoc, {
        success: function(status) {
          console.log("Saved ", modifiedDoc, status);
          var activity = {
            "verb": "<a target='_blank' href='#diff/oldrev/" + oldrev + "/newrev/" + status.rev + "'>updated</a> ",
            "verbicon": "icon-pencil",
            "directobjecticon": "icon-list",
            "directobject": "<a target='_blank' href='#data/" + modifiedDoc._id + "'>" + directobject + "</a> ",
            "indirectobject": "in <a target='_blank' href='#corpus/" + corpusid + "'>" + corpustitle + "</a>",
            "teamOrPersonal": "team",
            "context": " via Futon Bot.",
            "user": {
              "gravatar": gravatar,
              "username": name,
              "_id": name,
              "collection": "bots",
              "firstname": "Cleaner",
              "lastname": "Bot",
              "email": ""
            },
            "timestamp": Date.now(),
            "dateModified": JSON.parse(JSON.stringify(new Date()))
          };
          activities.saveDoc(activity, {
            success: function(message) {
              console.log("Saved activity", activity, message);
            },
            error: function(error) {
              console.log("Problem saving " + JSON.stringify(activity));
            }
          });
        },
        error: function(error) {
          console.log("Problem saving " + JSON.stringify(modifiedDoc));
        }
      });

    })(cleanedDoc, cleanedDoc._rev, directobjectMessage);
  };

  return {
    gravatar: gravatar,
    name: name,
    description: cleaningFunction,
    save: saveDocBackToCouchDB,
    run: function() {
      /* dont run until youre sure you want to */
      var count = 0;
      database.allDocs({
        success: function(result) {
          //console.log(result);
          var data = result.rows;

          var openDocSuccess = function(originalDoc) {
            /* transliterate the utterance line into romanized, then save the data back to the db */
            cleaningFunction(originalDoc, saveDocBackToCouchDB);
          };
          var openDocError = function(error) {
            console.log("Error opening your docs ", error);
          };

          for (var couchdatum in data) {
            count++;
            if (count > stopAt) {
              return;
            }
            database.openDoc(data[couchdatum].id, {
              success: openDocSuccess,
              error: openDocError
            });
          }
        },
        error: function(error) {
          console.log("Error opening the database ", error);
        }
      });
    }
  };
};
