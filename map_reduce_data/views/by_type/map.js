function byType(doc) {

  var debugMode = true,
    showHumanDates = true,
    skipBotComments = true;

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
      } else if (doc.sessionFields) {
        guessedType = "Session";
      } else if (doc.text && doc.username && doc.timestamp && doc.gravatar) {
        guessedType = "Comment";
      } else if (doc.symbol && doc.tipa !== undefined) {
        guessedType = "UnicodeSymbol";
      } else if (doc.datumIds) {
        guessedType = "DataList";
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
      // handle contextualized titles
      if (preview.default) {
        preview = preview.default;
      }
      // return preview;
    }

    // Get direct object from activity
    else if (type === "Activity") {
      // preview = doc.verb + " " + doc.directobject;
      preview = doc.verb + " " + doc.directobjecticon;
    }

    // Get gravatar from a user
    else if (type === "User" || type === "UserMask") {
      return doc.gravatar;
    }

    // Use anonymous code from participants or speakers
    else if (type === "Participant" || type === "Consultant" || type === "Speaker") {
      if (doc.fields && doc.fields.length && doc.fields[0] && doc.fields[0].mask) {
        return doc.fields[0].mask;
      } else {
        return type;
      }
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
      if (fields && fields.length >= 2 && fields[1] && fields[1].mask) {
        preview = fields[1].mask;
      }
    }

    // Make the preview a max length of 30 
    if (preview.length > 40) {
      preview = preview.substring(0, 20) + "..." + preview.substring(preview.length - 10, preview.length);
    }
    return preview;
  };

  var createIndexableComment = function(docid, comment) {
    var commentUUID,
      commentPreview,
      commentDateCreated,
      commentDateModified;

    commentDateCreated = convertToTimestamp(comment.timestamp);
    commentDateModified = comment.timestampModified || commentDateCreated;

    commentUUID = docid + "/comment/" + commentDateCreated;
    commentPreview = comment.text;
    if (commentPreview && commentPreview.length > 100) {
      commentPreview = commentPreview.substring(0, 40) + "..." + commentPreview.substring(commentPreview.length - 40, commentPreview.length);
      // Ensure all @mentions are in the preview 
      var mentions = comment.text.match(/@[^ \t]*/g);
      if (mentions && mentions.length) {
        commentPreview = mentions.join(" ") + " : " + commentPreview;
      }
    }

    // var milisecondsSinceComment = Date.now() - commentDateModified;

    if (showHumanDates) {
      commentDateCreated = commentDateCreated ? new Date(commentDateCreated) : 0;
      commentDateModified = commentDateModified ? new Date(commentDateModified) : 0;
    }

    return [commentDateModified, commentUUID, commentDateCreated, commentPreview, comment.gravatar];
  };


  var createIndexableMediaFile = function(media) {
    var mediaUUID,
      mediaPreview,
      mediaDateCreated,
      mediaDateModified;

    mediaUUID = media.URL;
    mediaPreview = media.caption || media.description;
    if (mediaPreview && mediaPreview.length > 60) {
      mediaPreview = mediaPreview.substring(0, 20) + "..." + mediaPreview.substring(mediaPreview.length - 20, mediaPreview.length);
    }
    mediaDateCreated = media.timestamp;
    mediaDateModified = media.timestampModified;
    // var milisecondsSinceComment = Date.now() - mediaDateModified;

    if (showHumanDates) {
      mediaDateCreated = mediaDateCreated ? new Date(mediaDateCreated) : 0;
      mediaDateModified = mediaDateModified ? new Date(mediaDateModified) : 0;
    }

    return [mediaDateModified, mediaUUID, mediaDateCreated, mediaPreview];
  };

  console.log("Processing doc " + doc._id);
  try {
    var type = guessType(doc),
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
        emit(" skipping typeless doc", [0, doc._id, 0, doc]);
      } else {
        emit(" skipping typeless doc", [0, doc._id, 0, ""]);
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
    var embeddedDataIndex;
    if (doc.comments) {
      for (embeddedDataIndex = 0; embeddedDataIndex < doc.comments.length; embeddedDataIndex++) {
        if (skipBotComments && doc.comments[embeddedDataIndex].username && doc.comments[embeddedDataIndex].username.indexOf("bot") > -1) {
          // if (debugMode) {
          //   emit(" skipping bot comment", doc.comments[embeddedDataIndex]);
          // } else {
          //   emit(" skipping bot comment", doc._id + "/comment/" + doc.comments[embeddedDataIndex].timestamp);
          // }
          continue;
        }
        emit("Comment", createIndexableComment(doc._id, doc.comments[embeddedDataIndex]));
      }
    }

    if (doc.images) {
      for (embeddedDataIndex = 0; embeddedDataIndex < doc.images.length; embeddedDataIndex++) {
        emit("Image", createIndexableMediaFile(doc.images[embeddedDataIndex]));
      }
    }

    if (doc.audioVideo) {
      var audioVideos = doc.audioVideo;
      if (!Array.isArray(audioVideos)) {
        audioVideos = []; //skipping old audio from pre 2.0 dbs
      }
      for (embeddedDataIndex = 0; embeddedDataIndex < audioVideos.length; embeddedDataIndex++) {
        var fileType = audioVideos[embeddedDataIndex].type;
        if (fileType) {
          fileType = fileType[0].toUpperCase() + fileType.substring(1, fileType.length);
        }
        emit(fileType, createIndexableMediaFile(audioVideos[embeddedDataIndex]));
      }
    }

  } catch (error) {
    emit(" error" + error, doc._id);
  }


  try {
    exports.debugMode = debugMode;
    exports.showHumanDates = showHumanDates;
    exports.guessType = guessType;
    exports.guessPreview = guessPreview;
    exports.skipBotComments = skipBotComments;
    exports.convertToTimestamp = convertToTimestamp;
    exports.createIndexableMediaFile = createIndexableMediaFile;
  } catch (e) {
    //  // DEBUG console.log("not in a node context")
  }
}


try {
  exports.byType = byType;
  exports.by_type = byType;
} catch (e) {
  //  // DEBUG console.log("not in a node context")
}
