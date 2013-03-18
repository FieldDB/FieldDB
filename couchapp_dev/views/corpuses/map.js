/* updated to be compatible with pre-1.38 databases */
function(doc) {
  if (doc.collection == "corpuses" || doc.titleAsUrl == "private_corpus") {
    emit(doc._id, doc);
  }
};