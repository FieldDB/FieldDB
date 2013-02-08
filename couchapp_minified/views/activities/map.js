function(doc) {
  if (doc.collection == "activities" || doc.directobject) {
    emit("activities", doc);
  }
};