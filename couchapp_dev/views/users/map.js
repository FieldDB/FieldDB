/* updated to be compatible with pre-1.38 databases */
function(doc) {
  /* if this document has been deleted, the ignore it and return immediately */
  if(doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
  if (doc.collection == "users" || doc.username) {
    emit(doc._id, doc);
  }
};