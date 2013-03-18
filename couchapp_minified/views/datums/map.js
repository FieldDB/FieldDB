/* updated to be compatible with pre-1.38 databases */
function(doc) {
  if (doc.collection == "datums" || (doc.datumFields && doc.session)) {
    emit(doc._id, doc);
  }
};