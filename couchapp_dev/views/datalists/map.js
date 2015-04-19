/* updated to be compatible with pre-1.38 databases */
function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    if (doc.fieldDBtype === "DataList" || doc.collection == "datalists" || doc.datumIds) {
      var dateModified = doc.dateModified;
      if (dateModified) {
        try {
          dateModified = dateModified.replace(/["\\]/g, '');
          dateModified = new Date(dateModified);
          /* Use date modified as a timestamp if it isnt one already */
          dateModified = dateModified.getTime();
        } catch (e) {
          //emit(error, null);
        }
      }
      // var date = doc.dateModified ? doc.dateModified.replace(/["\\]/g, '') : "";
      //doc.fieldDBtype = "DataList";
      emit(dateModified, doc);
    }
  } catch (e) {
    //emit(e, 1);
  }
};
