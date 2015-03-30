/* updated to be compatible with pre-1.38 databases */
function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;

    if (doc.collection == "private_corpora" || doc.collection == "private_corpuses" || doc.api === "private_corpora" || doc.api === "private_corpuses" || (doc.confidential && doc.confidential.secretkey)) {
      //doc.fieldDBtype = "Corpus";
      emit(doc.timestamp, doc);
    }
  } catch (e) {
    //emit(e, 1);
  }
};
