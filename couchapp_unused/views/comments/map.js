/* updated to be compatible with pre-1.38 databases */

function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    if (!doc.comments || doc.comments.length < 1) {
      return;
    }
    var title = doc.title;
    if (!title && doc.datumFields && doc.datumFields.length) {
      doc.datumFields.map(function(datumField) {
        if (!title && datumField.id === "orthography" || datumField.label === "orthography" || datumField.id === "utterance" || datumField.label === "utterance") {
          title = datumField.mask;
        }
      });
    }
    if (!title) {
      title = doc._id;
    }
    var commentIndex;
    for (commentIndex = 0; commentIndex < doc.comments.length; commentIndex++) {
      var comment = JSON.parse(JSON.stringify(doc.comments[commentIndex]));
      var lastCommentsTimestampModified = comment.timestampModified;
      var milisecondsSinceComment = Date.now() - lastCommentsTimestampModified;
      comment.docId = doc._id;
      comment.docTitle = title;
      emit(milisecondsSinceComment, comment);
    }

  } catch (e) {
    //emit(e, 1);
  }
}
