function(doc) {
  /* if this document has been deleted, the ignore it and return immediately */
  if(doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
  if (doc.collection) {
    emit(doc.collection, doc);
  }
};