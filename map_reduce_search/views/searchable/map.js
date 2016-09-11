function(doc) {
  var includeEmpty = false;

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
      } else if (includeEmpty) {
        obj[datum.datumFields[i][fieldKeyName]] = "";
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
        } else if (includeEmpty) {
          obj[datum.datumFields[i][fieldKeyName]] = "";
        }
      }
    }
    if (includeEmpty) {
      obj.utterance = obj.utterance || "";
      obj.morphemes = obj.morphemes || "";
      obj.gloss = obj.gloss || "";
    }

    return obj;
  };
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    if (doc.datumFields && doc.session) {
      var datum = convertDatumIntoSimpleObject(doc);
      if (!datum) {
        return;
      }

      // Index limited info about the comments
      if (doc.comments && doc.comments.length) {
        datum.comments = doc.comments.map(function(comment) {
          return {
            username: comment.username,
            text: comment.text,
            timestamp: comment.timestamp
          };
        });
      } else if (includeEmpty) {
        datum.comments = [];
      }

      // Index limited info about the media
      if (doc.audioVideo && doc.audioVideo.length && typeof doc.audioVideo.map === "function") {
        datum.media = doc.audioVideo.map(function(media) {
          var small = {
            filename: media.filename,
            timestamp: media.timestamp
          };

          if (media.details.syllablesAndUtterances) {
            small.syllableCount = media.details.syllablesAndUtterances.syllableCount || 0;
            small.pauseCount = media.details.syllablesAndUtterances.pauseCount || 0;
            small.speakingTotalDuration = media.details.syllablesAndUtterances.speakingTotalDuration || 0;
            small.speakingRate = media.details.syllablesAndUtterances.speakingRate || 0;
            small.articulationRate = media.details.syllablesAndUtterances.articulationRate || 0;
          }

          return small;
        });
      } else if (includeEmpty) {
        datum.media = [];
      }

      emit(datum, doc._id);
    }
  } catch (e) {
    //emit(e, 1);
  }
}
