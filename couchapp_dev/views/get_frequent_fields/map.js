function(doc) {
  if ((doc.datumFields) && (doc.session)) {
    emit("datumTotal", 1);
    for ( var i in doc.datumFields) {
      if (doc.datumFields[i].mask) {
        emit(doc.datumFields[i].label, 1);
      }
    }
  }
}