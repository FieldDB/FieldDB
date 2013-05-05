/* updated to be compatible with pre-1.38 databases */
function(doc) {
  /* if this document has been deleted, the ignore it and return immediately */
  if(doc.trashed && doc.trashed.indexOf("deleted") > -1) 
    emit(doc.dateModified, doc);
};