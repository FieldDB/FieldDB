function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
    if ((doc.datumFields) && (doc.session)) {
      emit("datumTotal", 1);
      for (var i in doc.datumFields) {
        if (doc.datumFields[i].mask) {
          emit(doc.datumFields[i].label, 1);
        }
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
