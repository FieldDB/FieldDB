/* updated to be compatible with pre-1.38 databases */
function(doc) {
  if (doc.collection == "users" || doc.username) {
    emit(doc._id, doc);
  }
};