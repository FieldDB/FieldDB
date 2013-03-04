function(doc) {
  if (doc.dateModified) {
    emit(doc.dateModified, doc);
  }
}