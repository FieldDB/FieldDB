function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
    if (doc.datumFields && doc.session) {
      emit("datumTotal", 1);
      for (var i = 0; i < doc.datumFields.length; i++) {

        if (doc.datumFields[i] && (doc.datumFields[i].mask || doc.datumFields[i].value)) {
          var fieldKeyName = "label";
          if (doc.datumFields[i].id && doc.datumFields[i].id.length > 0) {
            fieldKeyName = "id"; /* update to version 2.35+ */
          } else {
            fieldKeyName = "label";
          }
          emit(doc.datumFields[i][fieldKeyName], 1);
        }
      }
    }
  } catch (e) {
    // emit(e, 1);
  }
}
