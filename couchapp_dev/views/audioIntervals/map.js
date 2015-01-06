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
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
    if (doc.datumFields && doc.session) {

      if (doc.audioVideo && doc.audioVideo.length > 0) {
        var obj = convertDatumIntoSimpleObject(doc);
        for (var audioVideoIndex = 0; audioVideoIndex < doc.audioVideo.length; audioVideoIndex++) {
          obj.audioVideo = doc.audioVideo[audioVideoIndex];
          emit(doc.audioVideo[audioVideoIndex].filename, obj);
        }
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
