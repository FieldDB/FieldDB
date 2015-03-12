/* updated to be compatible with pre-1.38 databases */
function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;

    if (doc.collection == "private_corpora" || (doc.confidential && doc.confidential.secretkey)) {
      //doc.fieldDBtype = "Corpus";
      emit(doc.timestamp, {
        title: doc.title,
        titleAsUrl: doc.titleAsUrl,
        description: doc.description
      });
    }
  } catch (e) {
    //emit(e, 1);
  }
};
