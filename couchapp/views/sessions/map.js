/* updated to be compatible with pre-1.38 databases */
function(doc) {
  if (doc.collection == "sessions" || (doc.sessionFields && !doc.datumFields)) {
    emit("sessions", doc);
  }
};