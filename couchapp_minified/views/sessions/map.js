function(doc) {
  if (doc.collection == "sessions") {
    emit(doc.collection, doc);
  }
};