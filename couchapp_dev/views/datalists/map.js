/* updated to be compatible with pre-1.38 databases */
function(doc) {
  if (doc.collection == "datalists" || doc.datumIds) {
    emit("datalists", doc);
  }
};