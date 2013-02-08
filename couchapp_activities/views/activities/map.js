function(doc) {
  if (doc.collection == "activities" || doc.teamOrPersonal) {
    emit(doc.timestamp, doc);
  }
};