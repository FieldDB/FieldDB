var guessType = function(doc) {
  // v3.0+
  if (doc.fieldDBtype) {
    return doc.fieldDBtype;
  }
  if (doc._id.indexOf("messages.json") > -1) {
    return "Locales";
  }

  // < v3.0+
  var guessedType = doc.previousFieldDBtype || doc.jsonType || doc.collection || "";
  if (!guessedType && doc.api && doc.api.length > 0) {
    guessedType = doc.api[0].toUpperCase() + doc.api.substring(1, doc.api.length);
  }

  // Api/Collection used the plural
  if ((doc.collection || doc.api) && guessedType[guessedType.length - 1] === "s") {
    guessedType = guessedType.substring(0, guessedType.length - 1);
  }

  // Uppercase first char for Class name
  guessedType = guessedType[0].toUpperCase() + guessedType.substring(1, guessedType.length);
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

function(doc) {
  var debugMode = true;


  /* if this document has been deleted, put it in the deleted category */
  if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
    emit("deleted", doc.id);
    return;
  }

  var type = guessType(doc);
  var preview = "";
  var dateCreated = "";
  var dateModified = "";

  if (!type) {
    if (debugMode) {
      emit(" ignoring typeless doc", doc._id);
    }
    return;
  }

  if(type == "Locales"){
     var localeCode = doc._id.replace("/messages.json", "");
    if (localeCode.indexOf("/") > -1) {
      localeCode = localeCode.substring(localeCode.lastIndexOf("/"));
    }
    localeCode = localeCode.replace(/[^a-z-]/g, "").toLowerCase();
    if (!localeCode || localeCode.length < 2) {
      localeCode = "default";
    }
    emit(localeCode, doc);
    return;
  }

  /* Version <3.x */
  emit(type, [dateModified, doc._id, dateCreated, preview]);

  if (doc.comments) {
    // todo emit comment
    // var title = doc.title;
    // if (!title && doc.datumFields && doc.datumFields.length) {
    //   doc.datumFields.map(function(datumField) {
    //     if (!title && datumField.id === "orthography" || datumField.label === "orthography" || datumField.id === "utterance" || datumField.label === "utterance") {
    //       title = datumField.mask;
    //     }
    //   });
    // }
    // if (!title) {
    //   title = doc._id;
    // }
    // var commentIndex;
    // for (commentIndex = 0; commentIndex < doc.comments.length; commentIndex++) {
    //   var comment = JSON.parse(JSON.stringify(doc.comments[commentIndex]));
    //   var lastCommentsTimestampModified = comment.timestampModified;
    //   var milisecondsSinceComment = Date.now() - lastCommentsTimestampModified;
    //   comment.docId = doc._id;
    //   comment.docTitle = title;
    //   emit(milisecondsSinceComment, comment);
    // }

 // var obj = convertDatumIntoSimpleObject(doc);

 //      var mostRecentComment = doc.comments[doc.comments.length - 1];
 //      var lastCommentsTimestampModified = mostRecentComment.timestampModified;
 //      var milisecondsSinceLastComment = Date.now() - lastCommentsTimestampModified;
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
  
}

// try {
//   exports.by_type = exports.byType = by_type;
// } catch (e) {
//   //  // DEBUG console.log("not in a node context")
// }
