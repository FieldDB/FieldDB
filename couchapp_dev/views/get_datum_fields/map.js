function(doc) {
  if ((doc.datumFields) && (doc.session)) {
    var obj = {};
    for (i = 0; i < doc.datumFields.length; i++) {
      if (doc.datumFields[i].mask) {
        obj[doc.datumFields[i].label] = doc.datumFields[i].mask;
      }
    }
    if (doc.session.sessionFields) {
      for (j = 0; j < doc.session.sessionFields.length; j++) {
        if (doc.session.sessionFields[j].mask) {
          obj[doc.session.sessionFields[j].label] = doc.session.sessionFields[j].mask;
        }
      }
    }
    emit(obj, doc._id);
  }
}