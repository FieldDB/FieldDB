function(doc) {
  if (doc.collection == "datalists") {
    emit(doc.collection, doc);
  }
};