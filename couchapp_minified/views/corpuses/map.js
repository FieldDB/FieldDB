function(doc) {
  if (doc.collection == "corpuses") {
    emit(doc.collection, doc);
  }
};