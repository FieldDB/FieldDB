function search(doc) {
  var debugMode = true,
    showHumanDates = true;

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

  var convertDatumIntoSimpleObject = function(datum) {
    if (!datum.session) {
      return;
    }
    var obj = {},
      fieldKeyName = "label",
      fields;

    fields = datum.fields || datum.datumFields;
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].id && fields[i].id.length > 0) {
        fieldKeyName = "id"; /* update to version 2.35+ */
      } else {
        fieldKeyName = "label";
      }
      if (fields[i].mask) {
        obj[fields[i][fieldKeyName]] = fields[i].mask;
      }
    }
    if (datum.session.sessionFields) {
      for (var j = 0; j < datum.session.sessionFields.length; j++) {
        if (datum.session.sessionFields[j].id && datum.session.sessionFields[j].id.length > 0) {
          fieldKeyName = "id"; /* update to version 2.35+ */
        } else {
          fieldKeyName = "label";
        }
        if (datum.session.sessionFields[j].mask) {
          obj[datum.session.sessionFields[j][fieldKeyName]] = datum.session.sessionFields[j].mask;
        }
      }
    }
    return obj;
  };
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    var obj = convertDatumIntoSimpleObject(doc);
    if (!obj) {
      return;
    }
    if (doc.comments && doc.comments.length) {
      obj["comments"] = "";
      doc.comments.map(function(comment) {
        obj["comments"] += comment.username;
        if (comment.text) {
          obj["comments"] += ": " + comment.text + ". ";
        }
      });
    }
    if (doc.audioVideo && doc.audioVideo.length && typeof doc.audioVideo.map === "function") {
      obj["audioVideo"] = "";
      doc.audioVideo.map(function(audioVideo) {
        obj["audioVideo"] += audioVideo.filename;
        if (audioVideo.description) {
          obj["audioVideo"] += ", " + audioVideo.description + ". ";
        }
      });
    }
    if (doc.images&& doc.images.length) {
      obj["images"] = "";
      doc.images.map(function(image) {
        obj["images"] += image.filename;
        if (image.caption) {
          obj["images"] += ", " + image.caption + ". ";
        }
      });
    }
    var dateCreated = convertToTimestamp(doc.dateCreated || doc.dateEntered || doc.timestamp),
      dateModified = convertToTimestamp(doc.dateModified);

    if (!dateModified) {
      dateModified = dateCreated;
    }

    /* see the dates while debugging */
    if (showHumanDates) {
      dateCreated = dateCreated ? new Date(dateCreated) : 0;
      dateModified = dateModified ? new Date(dateModified) : 0;
    }

    obj.dateCreated = dateCreated;
    obj.dateModified = dateModified;
    emit(dateCreated, obj);
  } catch (error) {
    emit(" error" + error, doc._id);
  }
}


try {
  exports.search = search;
} catch (e) {
  //  // DEBUG console.log("not in a node context")
}
