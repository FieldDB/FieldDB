function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf('deleted') > -1) return;
    if ((doc.datumFields) && (doc.session)) {
      for (var i in doc.datumFields) {
        if (doc.datumFields[i].mask) {
          emit({
            original: doc.datumFields[i].label,
            typed: doc.datumFields[i].label + '_t'
          }, 1);
        }
      }
      for (var i in doc.session.sessionFields) {
        if (doc.session.sessionFields[i].mask) {
          emit({
            original: doc.session.sessionFields[i].label,
            typed: doc.session.sessionFields[i].label + '_t'
          }, 1);
        }
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
