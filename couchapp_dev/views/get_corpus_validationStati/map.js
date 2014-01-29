function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1)
      return;
    if ((doc.datumFields) && (doc.session)) {
      for (var i in doc.datumFields) {
        if (doc.datumFields[i].label == "validationStatus" && doc.datumFields[i].mask) {
          var validationStatus = doc.datumFields[i].mask.replace(/ be/g, "Be").replace(/ to/g, "To").replace(/ checked/g, "Checked");
          var stati = validationStatus.split(/[, ]/);
          for (var state in stati) {
            var thisValidationStatus = stati[state];
            thisValidationStatus = thisValidationStatus.replace(/[,!@#$%^&*()]/g, '').trim()
            if (thisValidationStatus) {
              thisValidationStatus = thisValidationStatus.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1);
              });
              emit(thisValidationStatus, 1);
            }
          }
        }
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
