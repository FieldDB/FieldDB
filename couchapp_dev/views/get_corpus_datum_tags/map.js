function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1)
      return;
    if ((doc.datumFields) && (doc.session)) {
      for (var i in doc.datumFields) {
        if (doc.datumFields[i].label == "tags" && doc.datumFields[i].mask) {
          var stati = doc.datumFields[i].mask.split(" ");
          for (var state in stati) {
            if (stati[state])
              emit(stati[state], 1);
          }
        }
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
