function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
    if ((doc.datumFields) && (doc.session)) {
      if(doc.audioVideo && doc.audioVideo.length > 0){
        for(var audioVideoIndex = 0; audioVideoIndex< doc.audioVideo.length; audioVideoIndex++){
        emit(doc.audioVideo[audioVideoIndex].filename, doc.audioVideo[audioVideoIndex]);
        }
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
