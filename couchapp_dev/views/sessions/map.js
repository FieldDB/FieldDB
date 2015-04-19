/* updated to be compatible with pre-1.38 databases */
function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    if (doc.fieldDBtype === "Session" || doc.collection === "sessions" || doc.fieldDBtype === "Session" || (doc.sessionFields && !doc.datumFields)) {
      var date = doc.dateModified ? doc.dateModified.replace(/["\\]/g, '') : "";
      //doc.fieldDBtype = "Session";
      emit(date, doc);
    }
  } catch (e) {
    //emit(e, 1);
  }
};
