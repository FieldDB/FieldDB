/* updated to be compatible with pre-1.38 databases */

function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    if (doc.collection === "datums" || (doc.datumFields && doc.session)) {
      var datum = {};
      for (var i = 0; i < doc.datumFields.length; i++) {
        if (doc.datumFields[i].mask) {
          datum[doc.datumFields[i].label] = doc.datumFields[i].mask;
        }
      }
      if (doc.session.sessionFields) {
        for (var j = 0; j < doc.session.sessionFields.length; j++) {
          if (doc.session.sessionFields[j].mask) {
            datum[doc.session.sessionFields[j].label] = doc.session.sessionFields[j].mask;
          }
        }
      }
      var enteredByUser = datum.enteredByUser || datum.user;
      emit(enteredByUser, datum);
    }
  } catch (e) {
    //emit(e, 1);
  }
}
