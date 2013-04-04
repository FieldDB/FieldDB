function(doc) {
if(doc.header.assignment.id)
  emit(doc.header.assignment.id, doc);
}