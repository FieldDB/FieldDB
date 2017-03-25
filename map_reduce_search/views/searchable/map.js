function(doc) {
  var includeEmpty = false;

  var convertDatumIntoSimpleObject = function(datum) {
    var obj = {};
    var fieldKeyName = "label";
    var fields = datum.fields || datum.datumFields;

    for (var i = 0; i < fields.length; i++) {
      if (fields[i].id && fields[i].id.length > 0) {
        fieldKeyName = "id"; /* update to version 2.35+ */
      } else {
        fieldKeyName = "label";
      }
      if (fields[i].mask) {
        obj[fields[i][fieldKeyName]] = fields[i].mask;
      } else if (includeEmpty) {
        obj[fields[i][fieldKeyName]] = "";
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
          obj[fields[i][fieldKeyName]] = "";
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
      // emit('deleted', doc._id);
      return;
    }
    if ((doc.fields || doc.datumFields) && doc.session) {
      var datum = convertDatumIntoSimpleObject(doc);
      if (!datum) {
        // emit('convertDatumIntoSimpleObject returned empty object', doc._id);
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
      var media = [];
      if (doc.audioVideo && doc.audioVideo.length && typeof doc.audioVideo.map === "function") {
        media = doc.audioVideo;
      }
      if (doc.images) {
        media = media.concat(doc.images);
      }

      media = media.map(function(media) {
        var small = {
          filename: media.filename,
          timestamp: media.timestamp,
          type: media.type,
          description: media.caption || media.description
        };

        if (media.details && media.details.syllablesAndUtterances) {
          small.syllableCount = media.details.syllablesAndUtterances.syllableCount || 0;
          small.pauseCount = media.details.syllablesAndUtterances.pauseCount || 0;
          small.speakingTotalDuration = media.details.syllablesAndUtterances.speakingTotalDuration || 0;
          small.speakingRate = media.details.syllablesAndUtterances.speakingRate || 0;
          small.articulationRate = media.details.syllablesAndUtterances.articulationRate || 0;
        }

        return small;
      });

      if (media && media.length) {
        datum.media = media;
      } else if (includeEmpty) {
        datum.media = [];
      }

      emit(datum, doc._id);
    }
  } catch (e) {
    //emit(e, 1);
  }
}
