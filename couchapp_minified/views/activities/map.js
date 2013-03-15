function(doc) {
  if (doc.collection == "activities" || doc.directobject) {
    emit(doc._id, doc);
  }
};