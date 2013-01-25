function(doc) {
  if (doc.collection == "datums") {
    emit(doc.collection, doc);
  }
};