function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
    if ((doc.datumFields) && (doc.session)) {

      if (doc.audioVideo && doc.audioVideo.length > 0) {
        var obj = {};
        for (i = 0; i < doc.datumFields.length; i++) {
          if (doc.datumFields[i].mask) {
            obj[doc.datumFields[i].label] = doc.datumFields[i].mask;
          }
        }
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
