function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
    if ((doc.datumFields) && (doc.session)) {
      var obj = {};
      for (i = 0; i < doc.datumFields.length; i++) {
        if (doc.datumFields[i].mask) {
          obj[doc.datumFields[i].label] = doc.datumFields[i].mask;
        }
      }
      if (doc.session.sessionFields) {
        for (j = 0; j < doc.session.sessionFields.length; j++) {
          if (doc.session.sessionFields[j].mask) {
            obj[doc.session.sessionFields[j].label] = doc.session.sessionFields[j].mask;
          }
        }
      }
      if (doc.comments) {
        obj["comments"] = JSON.stringify(doc.comments);
      }
      if (doc.audioVideo) {
        obj["audioVideo"] = JSON.stringify(doc.audioVideo);
      }
      var dateEntered = doc.dateEntered;
      if (dateEntered) {
        try {
          dateEntered = dateEntered.replace(/["\\]/g, '');
          dateEntered = new Date(dateEntered);
          /* Use date modified as a timestamp if it isnt one already */
          dateEntered = dateEntered.getTime();
        } catch (e) {
          //emit(error, null);
        }
      }
      if (!dateEntered) {
        dateEntered = 0;
      }
      emit(dateEntered, obj);
    }
  } catch (e) {
    //emit(e, 1);
  }
}
