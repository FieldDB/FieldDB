function(doc) {
  var convertDatumIntoSimpleObject = function(datum) {
    var obj = {},
      fieldKeyName = "label";

    for (var i = 0; i < datum.datumFields.length; i++) {
      if (datum.datumFields[i].id && datum.datumFields[i].id.length > 0) {
        fieldKeyName = "id"; /* update to version 2.35+ */
      } else {
        fieldKeyName = "label";
      }
      if (datum.datumFields[i].mask) {
        obj[datum.datumFields[i][fieldKeyName]] = datum.datumFields[i].mask;
      }
    }
    if (datum.session.sessionFields) {
      for (var j = 0; j < datum.session.sessionFields.length; j++) {
        if (datum.session.sessionFields[j].id && datum.session.sessionFields[j].id.length > 0) {
          fieldKeyName = "id"; /* update to version 2.35+ */
        } else {
          fieldKeyName = "label";
        }
        if (datum.session.sessionFields[j].mask) {
          obj[datum.session.sessionFields[j][fieldKeyName]] = datum.session.sessionFields[j].mask;
        }
      }
    }
    return obj;
  };
  var uppercaseFirstLetter = function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1);
  };
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    if (doc.datumFields && doc.session) {
      var datum = convertDatumIntoSimpleObject(doc);
      if (datum.validationStatus) {
        datum.validationStatus = datum.validationStatus.replace(/ be/g, "Be").replace(/ to/g, "To").replace(/ checked/g, "Checked");
        var stati = datum.validationStatus.split(/[, ]/);
        for (var state in stati) {
          var thisValidationStatus = stati[state];
          thisValidationStatus = thisValidationStatus.replace(/[,!@#$%^&*()]/g, "").trim();
          if (thisValidationStatus) {
            thisValidationStatus = thisValidationStatus.replace(/\w\S*/g, uppercaseFirstLetter);
            emit(thisValidationStatus, 1);
          }
        }
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
