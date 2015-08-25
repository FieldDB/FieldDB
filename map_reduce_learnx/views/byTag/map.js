/* updated to be compatible with pre-1.38 databases */
function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }

    if (doc.collection === "datums" || (doc.datumFields && doc.session)) {
      var datum = {};
      // include trashed datum so that they can be deleted?
      // datum.trashed = doc.trashed;
      datum.appVersionsWhenModified = doc.appVersionsWhenModified || "";
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
      datum.created_at = dateEntered;
      datum.updated_at = doc.timestamp;
      for (var i = 0; i < doc.datumFields.length; i++) {
        if (doc.datumFields[i].mask) {
          datum[doc.datumFields[i].label] = doc.datumFields[i].mask;
        }
      }
      // if (doc.session.sessionFields) {
      //   for (var j = 0; j < doc.session.sessionFields.length; j++) {
      //     if (doc.session.sessionFields[j].mask) {
      //       datum[doc.session.sessionFields[j].label] = doc.session.sessionFields[j];
      //     }
      //   }
      // }
      datum._id = doc._id;
      datum._rev = doc._rev;
      if (doc.images) {
        datum.images = doc.images.map(function(image) {
          var url = image.URL;
          if (!image.URL && image.filename && image.filename.trim()) {
            url = "SERVER_URL/" + doc.pouchname + "/" + doc._id + "/" + image.filename.trim();
          }
          /* if the file is on this document, prefer this server */
          if (doc._attachments && doc._attachments[image.filename.trim()]) {
            url = "SERVER_URL/" + doc.pouchname + "/" + doc._id + "/" + image.filename.trim();
          }
          return url;
        }).join(",");
      }
      if (doc.comments) {
        datum.comments = doc.comments.map(function(comment) {
          return comment.text.replace(",", " ");
        }).join(",");
      }
      if (doc.audioVideo) {
        datum.audioVideo = doc.audioVideo.map(function(audioVideo) {
          var url = audioVideo.URL;
          if (!audioVideo.URL && audioVideo.filename && audioVideo.filename.trim()) {
            url = "SERVER_URL/" + doc.pouchname + "/" + doc._id + "/" + audioVideo.filename.trim();
          }
          /* if the file is on this document, prefer this server */
          if (doc._attachments && doc._attachments[audioVideo.filename.trim()]) {
            url = "SERVER_URL/" + doc.pouchname + "/" + doc._id + "/" + audioVideo.filename.trim();
          }
          return url;
        }).join(",");
      }
      // datum.actualJSON = doc;

      if (!datum.utterance) {
        if (datum.orthography) {
          datum.utterance = datum.orthography;
        } else if (datum.morphemes) {
          datum.utterance = datum.morphemes;
        }
      }
      if (!datum.morphemes) {
        datum.morphemes = datum.utterance || "";
      }
      if (!datum.gloss) {
        datum.gloss = "";
      }
      if (!datum.translation) {
        datum.translation = "";
      }
      if (!datum.related) {
        datum.related = "";
      }
      if (!datum.context) {
        datum.context = "";
      }
      /* Emit the datum by tag so that the android can download according to tags */
      var tags = datum.tags || "";
      if (!tags || !tags.trim()) {
        tags = "Uncategorized";
      }
      tags = tags.split(",");
      for (var tagIndex = 0; tagIndex < tags.length; tagIndex++) {
        emit(tags[tagIndex].trim(), datum);
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
