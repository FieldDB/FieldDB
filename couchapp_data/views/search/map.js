function(doc) { var convertDatumIntoSimpleObject = function(datum) {
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
    obj.utterance = obj.utterance || "";
    obj.morphemes = obj.morphemes || "";
    obj.gloss = obj.gloss || "";

    return obj;
  };
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
    if (doc.datumFields && doc.session) {
      var obj = convertDatumIntoSimpleObject(doc);

      if (doc.comments) {
        obj["comments"] = JSON.stringify(doc.comments);
      }
      if (doc.audioVideo) {
        obj["audioVideo"] = JSON.stringify(doc.audioVideo);
      }
      var dateEntered = doc.dateEntered;
      if (dateEntered) {
        try {
          dateEntered = dateEntered.replace(/["\\]/g, '');
          dateEntered = new Date(dateEntered);
          /* Use date modified as a timestamp if it isnt one already */
          dateEntered = dateEntered.getTime();
        } catch (e) {
          //emit(error, null);
        }
      }
      if (!dateEntered) {
        dateEntered = 0;
      }
      emit(dateEntered, obj);
    }
  } catch (e) {
    //emit(e, 1);
  }
}
