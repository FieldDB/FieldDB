/* updated to be compatible with pre-1.38 databases */

function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    if (doc.collection === "datums" || (doc.datumFields && doc.session)) {
      if (!doc.comments || doc.comments.length < 1) {
        return;
      }

      var obj = {};
      for (var i = 0; i < doc.datumFields.length; i++) {
        if (doc.datumFields[i].mask) {
          obj[doc.datumFields[i].label] = doc.datumFields[i].mask;
        }
      }
      if (doc.session.sessionFields) {
        for (var j = 0; j < doc.session.sessionFields.length; j++) {
          if (doc.session.sessionFields[j].mask) {
            obj[doc.session.sessionFields[j].label] = doc.session.sessionFields[j].mask;
          }
        }
      }

      var mostRecentComment = doc.comments[doc.comments.length - 1];
      var lastCommentsTimestampModified = mostRecentComment.timestampModified;
      var milisecondsSinceLastComment = Date.now() - lastCommentsTimestampModified;
      emit(milisecondsSinceLastComment, {
        user: mostRecentComment.username,
        time: new Date(mostRecentComment.timestampModified).toString(),
        comment: mostRecentComment.text,
        datum: obj
      });
    }
  } catch (e) {
    //emit(e, 1);
  }
}
