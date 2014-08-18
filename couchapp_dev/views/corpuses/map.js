/* updated to be compatible with pre-1.38 databases */
function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;

    if (doc.collection == "corpuses" || doc.titleAsUrl == "private_corpus") {
      doc.type = "CorpusMask";
      emit(doc.timestamp, doc);
    }
  } catch (e) {
    //emit(e, 1);
  }
};
