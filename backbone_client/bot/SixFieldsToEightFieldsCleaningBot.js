/* Depends on jquery couch  */

// Array.prototype.getUnique = function() {
//   var u = {},
//     a = [];
//   for (var i = 0, l = this.length; i < l; ++i) {
//     if (u.hasOwnProperty(this[i])) {
//       continue;
//     }
//     a.push(this[i]);
//     u[this[i]] = 1;
//   }
//   return a;
// };

var judgementToNotes = false; // 4f868ba9a79e57479ddbe4f62a0a4379
var judgementToIPA = false; // 4f868ba9a79e57479ddbe4f62a0a1ee9
var tagsToNotes = false; // 4f868ba9a79e57479ddbe4f62a0c8ef5
var tagsToIPA = true; // 4f868ba9a79e57479ddbe4f62a0960fa

var Bot = function(dbname, corpusid, corpustitle, datalistWhichShouldBeCleaned) {
  if (!dbname || !corpusid || !corpustitle) {
    throw ("You must create this bot with a database name, a corpus id and a corpus title. ");
  }
  var stopAt = 100;

  var activities = $.couch.db(dbname + "-activity_feed");
  var database = $.couch.db(dbname);

  var name = "sixfieldscleaningbot";
  var gravatar = "968b8e7fb72b5ffe2915256c28a9414c";

  var cleaningFunction = function(datum, saveFunction) {
    if (!datum.collection || datum.collection !== "datums") {
      console.log("This isnt a new datum.");
      if (!datum.audioVideo) {
        console.log("This isnt a old datum.");
        return;
      }
    }

    var changes = [];
    var newNotes = "";
    var newIPA = "";
    var source = "";
    var indexOfNotesField;
    var indexOfPhoneticField;

    for (var field = datum.fields.length - 1; field >= 0; field--) {
      if (datum.fields[field].label === "notes") {
        indexOfNotesField = field;
      } else if (datum.fields[field].label === "phonetic") {
        indexOfPhoneticField = field;
      }
      if ((judgementToNotes || judgementToIPA) && datum.fields[field].label !== "judgement") {
        continue;
      }
      if ((tagsToNotes || tagsToIPA) && datum.fields[field].label !== "tags") {
        continue;
      }
      var previousMask = datum.fields[field].mask;
      if (previousMask && previousMask.trim) {
        previousMask = previousMask.trim();
      }
      var previousValue = datum.fields[field].value;
      if (previousValue && previousValue.trim) {
        previousValue = previousValue.trim();
      }
      if (judgementToNotes) {
        source = "judgement";
        newNotes = previousValue;
      } else if (judgementToIPA) {
        source = "judgement";
        newIPA = previousValue;
      } else if (tagsToNotes) {
        source = "tags";
        newNotes = previousValue;
      } else if (tagsToIPA) {
        source = "tags";
        newIPA = previousValue;
      }
    }
    if (newIPA && newNotes) {
      throw "This field isn't supposed to become both notes and ipa.";
    }
    if (newNotes) {
      changes.push(" copied '" + newNotes + "' from " + source + " ->  notes ");
      var notesField = {
        "label": "notes",
        "shouldBeEncrypted": "",
        "help": "Notes about how the data was collected, context for the data or any other information or description needed. (use comments for questions or comments)",
        "value": newNotes,
        "mask": newNotes,
        "encrypted": ""
      };
      if (indexOfNotesField >= 0) {
        datum.fields[indexOfPhoneticField] = notesField;
      } else {
        datum.fields.push(notesField);
      }
    } else if (newIPA) {
      changes.push(" copied '" + newIPA +"' from " + source + " ->  phonetic IPA ");
      var phoneticField = {
        "label": "phonetic",
        "shouldBeEncrypted": "",
        "help": "Phonetic transcription line in IPA (international Phonetic Alphabet)",
        "value": newIPA,
        "mask": newIPA,
        "encrypted": ""
      };
      if (indexOfPhoneticField >= 0) {
        datum.fields[indexOfPhoneticField] = phoneticField;
      } else {
        datum.fields.push(phoneticField);
      }
    }

    if (changes.length === 0) {
      console.log("No changes on " + datum._id);
      return;
    }

    var timestamp = Date.now();
    /* Record this event in the comments */
    var changeDescription = _.unique(changes).join("\n * ");
    console.log(changeDescription);
    datum.comments.push({
      "text": "Updated to new corpus template: " + changeDescription,
      "username": name,
      "timestamp": timestamp,
      "gravatar": gravatar,
      "timestampModified": timestamp
    });
    window.comments = datum.comments;


    if (typeof saveFunction === "function") {
      saveFunction(datum, changeDescription);
    }

  };

  var cleaningDataList;
  var cleaningActivitySummary = ["Commented: I could clean this automatically:"];
  var addThisDatumToCleaningDataList = function(datumid, directobject) {
    if (!datumid || !cleaningDataList) {
      return;
    }
    // cleaningDataList.datumIds.push(datumid);

    var timestamp = Date.now();
    cleaningDataList.comments.push({
      "text": "I could clean this automatically:\n * " + directobject,
      "username": name,
      "timestamp": timestamp,
      "gravatar": gravatar,
      "timestampModified": timestamp
    });
    cleaningActivitySummary.push(directobject);
    // var activity = {
    //   "verb": "<a target='_blank' href='#diff/oldrev/" + cleaningDataList._rev + "/newrev/" + cleaningDataList._rev + "'>updated</a> ",
    //   "verbicon": "icon-comment",
    //   "directobjecticon": "icon-list",
    //   "directobject": "<a target='_blank' href='#data/" + cleaningDataList._id + "'>Commented: I could clean this automatically:\n * " + directobject + "...</a> ",
    //   "indirectobject": "in <a target='_blank' href='#corpus/" + corpusid + "'>" + corpustitle + "</a>",
    //   "teamOrPersonal": "team",
    //   "context": " via Futon Bot.",
    //   "user": {
    //     "gravatar": gravatar,
    //     "username": name,
    //     "_id": name,
    //     "collection": "bots",
    //     "firstname": "Cleaner",
    //     "lastname": "Bot",
    //     "email": ""
    //   },
    //   "timestamp": Date.now(),
    //   "dateModified": JSON.parse(JSON.stringify(new Date()))
    // };
    // activities.saveDoc(activity, {
    //   success: function(message) {
    //     console.log("Saved activity", activity, message);
    //   },
    //   error: function(error) {
    //     console.log("Problem saving " + JSON.stringify(activity), error);
    //   }
    // });
  };
  var saveCleaningDataList = function() {
    if (!cleaningDataList) {
      throw "You didnt specify an optional datalist to save the cleaning to, so I cant save it...";
    }
    console.log("cleaningDataList", cleaningDataList);
    var realSave = confirm("Do you want to save these comments?\n" + cleaningActivitySummary.join("\n"));
    if (!realSave) {
      return;
    }
    database.openDoc(datalistWhichShouldBeCleaned, {
      success: function(datalist) {
        // datalist.datumIds = cleaningDataList.datumIds;
        datalist.comments = cleaningDataList.comments;
        // datalist.title = "Quote Cleaning DataList";
        // datalist.description = "These are the datum which could be automatically cleaned by the cleaner bot (see comments for what was found by the bot).";
        database.saveDoc(datalist, {
          success: function(status) {
            console.log("Saved datalist which could be cleaned automatically ", datalist, status);
            var activity = {
              "verb": "<a target='_blank' href='#diff/oldrev/" + datalist._rev + "/newrev/" + status.rev + "'>updated</a> ",
              "verbicon": "icon-pencil",
              "directobjecticon": "icon-pushpin",
              "directobject": "<a target='_blank' href='#data/" + datalist._id + "'>Updated the quote cleaning data list</a> " + cleaningActivitySummary.join("<br/>"),
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
              "appVersion":"1.24.1bot",
              "timestamp": Date.now(),
              "dateModified": JSON.parse(JSON.stringify(new Date()))
            };
            activities.saveDoc(activity, {
              success: function(message) {
                console.log("Saved activity", activity, message);
              },
              error: function(error) {
                console.log("Problem saving " + JSON.stringify(activity), error);
              }
            });
          },
          error: function(error) {
            console.log("Problem saving " + JSON.stringify(datalist), error);
          }
        });
      },
      error: function(error) {
        console.log("Error opening your doc ", error);
      }
    });
  };

  if (datalistWhichShouldBeCleaned) {
    database.openDoc(datalistWhichShouldBeCleaned, {
      success: function(datalist) {
        /* clear the datum ids in preparation for cleaning run. */
        // datalist.previousCleaningRuns = datalist.previousCleaningRuns || [];
        // datalist.previousCleaningRuns.push(_.unique(datalist.datumIds));
        // datalist.datumIds = [];
        datalist.comments = [];
        cleaningDataList = datalist;
      },
      error: function(error) {
        console.log("Error opening your doc ", error);
      }
    });
  }

  var saveDocBackToCouchDB = function(cleanedDoc, directobjectMessage) {
    (function(modifiedDoc, oldrev, directobject) {

      console.log("Here is what we would save ", modifiedDoc.comments);
      console.log("Adding this to the sixfieldscleaning datalist.");
      addThisDatumToCleaningDataList(modifiedDoc._id, directobject);
      if (!window.runForReal) {
        console.log("Here is what we would save ", modifiedDoc);
        return;
      }
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
            "appVersion":"1.24.1bot",
            "timestamp": Date.now(),
            "dateModified": JSON.parse(JSON.stringify(new Date()))
          };
          activities.saveDoc(activity, {
            success: function(message) {
              console.log("Saved activity", activity, message);
            },
            error: function(error) {
              console.log("Problem saving " + JSON.stringify(activity), error);
            }
          });
        },
        error: function(error) {
          console.log("Problem saving " + JSON.stringify(modifiedDoc), error);
        }
      });

    })(cleanedDoc, cleanedDoc._rev, directobjectMessage);
  };

  return {
    gravatar: gravatar,
    name: name,
    description: cleaningFunction,
    save: saveDocBackToCouchDB,
    saveCleaningDataList: saveCleaningDataList,
    run: function() {
      /* dont run until youre sure you want to */
      var count = 0;
      var datumIds = cleaningDataList.datumIds;
      window.runForReal = confirm("Do you want to run the cleaning operation (click cancel to prepare only).");
      for (var couchdatum in datumIds) {
        count++;
        if (count > stopAt) {
          return;
        }

        database.openDoc(datumIds[couchdatum], {
          success: function(originalDoc) {

            /* transliterate the utterance line into romanized, then save the data back to the db */
            cleaningFunction(originalDoc, saveDocBackToCouchDB);

          },
          error: function(error) {
            console.log("Error opening your docs ", error);
          }
        });
      }
    }
  };
};
