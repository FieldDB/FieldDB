function(doc) {
  if (doc.collection == "activities") {
    emit(doc.collection, doc);
  }
};