function byUserModified(doc) {
  var showHumanDates = true,
    skipBots = true;

  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      // DEBUG console.log(" skipping deleted datum", doc._id);
      return;
    }
    if (!(doc.fieldDBtype === "Datum" || doc.collection === "datums" || (doc.datumFields && doc.session))) {
      // DEBUG console.log(" skipping non datum", doc._id);
      return;
    }

    var preview = "",
      fields,
      dateCreated,
      dateModified,
      dateUserModified,
      usersWhoCreatedOrModifiedThisData = {
        size: 0
      },
      fieldIndex,
      userIndex;

    var convertToTimestamp = function(dateOrTimestamp) {
      if (dateOrTimestamp) {
        if (dateOrTimestamp[0] === "\"") {
          dateOrTimestamp = dateOrTimestamp.replace(/["\\]/g, "");
        }
        if (dateOrTimestamp[dateOrTimestamp.length - 1] === "Z") {
          dateOrTimestamp = new Date(dateOrTimestamp);
          /* Use date modified as a timestamp if it isnt one already */
          dateOrTimestamp = dateOrTimestamp.getTime();
        }
      }

      if (!dateOrTimestamp) {
        dateOrTimestamp = 0;
      }
      return dateOrTimestamp;
    };

    var addUser = function(user) {
      // console.log(user.username + " at " + user.timestamp);
      if (!usersWhoCreatedOrModifiedThisData[user.username]) {
        // DEBUG console.log("  setting user", user);
        usersWhoCreatedOrModifiedThisData[user.username] = user;
        usersWhoCreatedOrModifiedThisData.size++;
      } else if (!usersWhoCreatedOrModifiedThisData[user.username].timestamp || usersWhoCreatedOrModifiedThisData[user.username].timestamp < user.timestamp) {
        // DEBUG console.log("  More recent modification", user.timestamp);
        usersWhoCreatedOrModifiedThisData[user.username] = user;
      }
    };

    dateCreated = convertToTimestamp(doc.dateCreated || doc.dateEntered || doc.timestamp);
    dateModified = convertToTimestamp(doc.dateModified);

    if (showHumanDates) {
      dateCreated = dateCreated ? new Date(dateCreated) : 0;
      dateModified = dateModified ? new Date(dateModified) : 0;
    }

    if (doc.fields || doc.datumFields) {
      fields = doc.fields || doc.datumFields;
    } else {
      fields = [];
      // this isnt a datum
      return;
    }

    // Data pre 1.x
    if (doc.user && doc.user.username) {
      addUser(doc.user);
      // DEBUG console.log("Using  doc.user ");
    }

    // Data from some version of the spreadsheet
    if (doc.lastModifiedBy) {
      addUser({
        username: doc.lastModifiedBy
      });
      // DEBUG console.log("Using  doc.enteredByUser ");
    }

    if (doc.enteredByUser && doc.enteredByUser.username) {
      addUser(doc.enteredByUser);
      // DEBUG console.log("Using  doc.enteredByUser ");
    }

    // Data post 2.x
    for (fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
      if (fields[fieldIndex].id === "enteredByUser" || fields[fieldIndex].label === "enteredByUser") {
        if (fields[fieldIndex].json && fields[fieldIndex].json.user) {
          addUser(fields[fieldIndex].json.user);
          // DEBUG console.log("Using  doc.fields.enteredByUser.json.user ");
        } else if (fields[fieldIndex].user) {
          addUser(fields[fieldIndex].user);
          // DEBUG console.log("Using  doc.fields.enteredByUser.user ");
        }
      } else if (fields[fieldIndex].id === "modifiedByUser" || fields[fieldIndex].label === "modifiedByUser") {
        var users = fields[fieldIndex].users || fields[fieldIndex].json.users;
        for (userIndex = users.length - 1; userIndex >= 0; userIndex--) {
          if (users[userIndex] && users[userIndex].username) {
            addUser(users[userIndex]);
            // DEBUG console.log("Using  doc.fields.modifiedByUser[n].json.users ");
          } else {
            // DEBUG console.log("Skipping user with no user name.");
          }
        }
      } else if (fields[fieldIndex].id === "utterance" || fields[fieldIndex].label === "utterance") {
        preview = fields[fieldIndex].mask;
      }
    }

    // Pre 1.0 data
    if (usersWhoCreatedOrModifiedThisData.size === 0 && doc.session) {
      for (fieldIndex = 0; fieldIndex < doc.session.sessionFields.length; fieldIndex++) {
        if ((doc.session.sessionFields[fieldIndex].id === "user" || doc.session.sessionFields[fieldIndex].label === "user") && doc.session.sessionFields[fieldIndex].mask) {
          addUser({
            username: doc.session.sessionFields[fieldIndex].mask
          });
        }
      }
    }
    if (usersWhoCreatedOrModifiedThisData.size === 0) {
      var owner = "";
      if (doc.dbname) {
        doc.dbname.substring(doc.dbname.indexOf("-"));
      } else if (doc.pouchname) {
        doc.pouchname.substring(doc.pouchname.indexOf("-"));
      }
      addUser({
        username: "unknown"
      });
    }

    // Emit all uses who have touched this datum
    for (userIndex in usersWhoCreatedOrModifiedThisData) {
      if (usersWhoCreatedOrModifiedThisData.hasOwnProperty(userIndex) && userIndex !== "size") {
        dateUserModified = dateModified;
        if (usersWhoCreatedOrModifiedThisData[userIndex].timestamp) {
          dateUserModified = usersWhoCreatedOrModifiedThisData[userIndex].timestamp;
          if (showHumanDates) {
            dateUserModified = dateUserModified ? new Date(dateUserModified) : 0;
          }
        }
        if (skipBots && userIndex.indexOf("bot") > -1) {
          continue;
        }
        emit(userIndex, [dateUserModified, doc._id, dateCreated, preview, usersWhoCreatedOrModifiedThisData[userIndex]]);
      }
    }

  } catch (error) {
    emit(" error" + error, doc._id);
  }
}

try {
  exports.byUserModified = byUserModified;
  exports.by_user_modified = byUserModified;
} catch (e) {
  //  // DEBUG console.log("not in a node context")
}
