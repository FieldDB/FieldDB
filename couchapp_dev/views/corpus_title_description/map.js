/* updated to be compatible with pre-1.38 databases */
function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;

    if (doc.collection == "private_corpora" || doc.collection == "private_corpuses" || (doc.confidential && doc.confidential.secretkey)) {
      //doc.fieldDBtype = "Corpus";
      var gravatar;
      if (doc.team && doc.team.gravatar) {
        gravatar = doc.team.gravatar;
      }
      emit(doc.timestamp, {
        title: doc.title,
        titleAsUrl: doc.titleAsUrl,
        description: doc.description,
        pouchname: doc.dbname || doc.pouchname,
        dbname: doc.dbname || doc.pouchname,
        gravatar: gravatar
      });
    }
  } catch (e) {
    //emit(e, 1);
  }
};
