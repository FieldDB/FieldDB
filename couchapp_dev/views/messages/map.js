function(doc) {
  if (doc.collection == "messages") {
    emit(doc._id, doc);
  }
};