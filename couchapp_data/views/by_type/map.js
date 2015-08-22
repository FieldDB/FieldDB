var guessType = function(doc) {
  // v3.0+
  if (doc.fieldDBtype) {
    return doc.fieldDBtype;
  }
  if (doc._id.indexOf("messages.json") > -1) {
    return "Locales";
  }

  /* 
   * 
   * Handle data which were creatd before v3.0 
   */
  var guessedType = doc.previousFieldDBtype || doc.jsonType || doc.collection || "";
  if (!guessedType && doc.api && doc.api.length > 0) {
    guessedType = doc.api[0].toUpperCase() + doc.api.substring(1, doc.api.length);
  }

  // Api/Collection used the plural
  if ((doc.collection || doc.api) && guessedType[guessedType.length - 1] === "s") {
    guessedType = guessedType.substring(0, guessedType.length - 1);
  }

  // Uppercase first char for Class name
  if (guessedType) {
    guessedType = guessedType[0].toUpperCase() + guessedType.substring(1, guessedType.length);
  }

  if (guessedType === "Datalist") {
    guessedType = "DataList";
  }
  if (guessedType === "Corpora" || guessedType === "Corpuse") {
    guessedType = "CorpusMask";
  }
  if (guessedType === "Private_corpora" || guessedType === "Private_corpuse") {
    guessedType = "Corpus";
  }
  // all old datum are language datum
  if (guessedType === "Datum") {
    guessedType = "LanguageDatum";
  }
  if (guessedType === "") {
    if (doc.session) {
      guessedType = "LanguageDatum";
    } else if (doc.verb) {
      guessedType = "Activity";
    } else if (doc.datumFields && doc.sessionFields) {
      guessedType = "Corpus";
    } else if (doc.collection === "sessions" && doc.sessionFields) {
      guessedType = "Session";
    } else if (doc.text && doc.username && doc.timestamp && doc.gravatar) {
      guessedType = "Comment";
    } else if (doc.symbol && doc.tipa !== undefined) {
      guessedType = "UnicodeSymbol";
    }
  }
  return guessedType;
};

var convertToTimestamp = function(dateCreated) {
  if (dateCreated) {
    if (dateCreated[0] === "\"") {
      dateCreated = dateCreated.replace(/["\\]/g, "");
    }
    if (dateCreated[dateCreated.length - 1] === "Z") {
      dateCreated = new Date(dateCreated);
      /* Use date modified as a timestamp if it isnt one already */
      dateCreated = dateCreated.getTime();
    }
  }

  if (!dateCreated) {
    dateCreated = 0;
  }
  return dateCreated;
};

var guessPreview = function(doc, type) {
  var preview = doc.title || doc.preview || "",
    fields;

  if (preview) {
    return preview;
  }

  // Get direct object from activity
  if (type === "Activity") {
    // preview = doc.verb + " " + doc.directobject;
    preview = doc.verb + " " + doc.directobjecticon;
  }

  // Get gravatar from a user
  else if (type === "User") {
    return doc.gravatar;
  }

  // Get goal from session
  else if (type === "Session" || doc.sessionFields) {
    fields = doc.fields || doc.sessionFields;
    if (fields.length && fields[0].mask) {
      preview = fields[0].mask;
    }
  }

  // Get utterance from datum
  else if (type === "Datum" || type === "LanguageDatum" || doc.fields || doc.datumFields) {
    fields = doc.fields || doc.datumFields;
    if (fields && fields.length > 2 && fields[1] && fields[1].mask) {
      preview = fields[1].mask;
    }
  }

  // Make the preview a max length of 30 
  if (preview.length > 29) {
    preview = preview.substring(0, 30) + "...";
  }
  return preview;
};

function(doc) {
  try {
    var debugMode = true,
      showHumanDates = true,
      type = guessType(doc),
      preview = guessPreview(doc, type),
      dateCreated = convertToTimestamp(doc.dateCreated || doc.dateEntered || doc.timestamp),
      dateModified = convertToTimestamp(doc.dateModified);

    if (!dateModified) {
      dateModified = dateCreated;
    }

    /* see the dates while debugging */
    if (showHumanDates) {
      dateCreated = dateCreated ? new Date(dateCreated) : 0;
      dateModified = dateModified ? new Date(dateModified) : 0;
    }

    if (!type) {
      if (debugMode) {
        emit(" skipping typeless doc", doc);
      } else {
        emit(" skipping typeless doc", doc._id);
      }
      return;
    }

    /* if this document has been deleted, put it in the deleted category */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      emit("Deleted", [dateModified, doc._id, dateCreated, preview, type]);
      return;
    }

    if (type === "Locales") {
      var localeCode = doc._id.replace("/messages.json", "");
      if (localeCode.indexOf("/") > -1) {
        localeCode = localeCode.substring(localeCode.lastIndexOf("/"));
      }
      localeCode = localeCode.replace(/[^a-z-]/g, "").toLowerCase();
      if (!localeCode || localeCode.length < 2) {
        localeCode = "default";
      }
      emit(localeCode, doc._id);
      return;
    }

    emit(type, [dateModified, doc._id, dateCreated, preview]);

    /** 
     * Comments are emmitted with 
     * - their UUID is their index on the data's comments (so you can open them in context of the document they are on),
     * - a preview of their text, 
     * - the gravatar of the user and 
     *
     */
    if (doc.comments) {
      var commentIndex,
        comment,
        commentUUID,
        commentPreview,
        commentDateCreated,
        commentDateModified;

      for (commentIndex = 0; commentIndex < doc.comments.length; commentIndex++) {
        comment = doc.comments[commentIndex];
        commentUUID = doc._id + "/comment/" + comment.timestamp;
        commentPreview = comment.text;
        if (comment.text && comment.text.length > 100) {
          commentPreview = comment.text.substring(0, 100) + "...";
        }
        commentDateCreated = comment.timestamp;
        commentDateModified = comment.timestampModified;
        // var milisecondsSinceComment = Date.now() - commentDateModified;
        // 
        if (showHumanDates) {
          commentDateCreated = commentDateCreated ? new Date(commentDateCreated) : 0;
          commentDateModified = commentDateModified ? new Date(commentDateModified) : 0;
        }

        emit("Comment", [commentDateModified, commentUUID, commentDateCreated, commentPreview, comment.gravatar]);
      }

      // var obj = convertDatumIntoSimpleObject(doc);

      //      var mostRecentComment = doc.comments[doc.comments.length - 1];
      //      var commentDateModified = mostRecentComment.timestampModified;
      //      var milisecondsSinceLastComment = Date.now() - commentDateModified;
      //      emit(milisecondsSinceLastComment, {
      //        user: mostRecentComment.username,
      //        time: new Date(mostRecentComment.timestampModified).toString(),
      //        comment: mostRecentComment.text,
      //        datum: obj
      //      });
    }

    if (doc.images) {
      // todo emit images
    }

    if (doc.audioVideo) {
      // todo emit audioVideos
    }

  } catch (error) {
    emit(" error" + error, doc._id);
  }

}


// try {
//   exports.by_type = exports.byType = by_type;
// } catch (e) {
//   //  // DEBUG console.log("not in a node context")
// }
