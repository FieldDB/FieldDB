/* updated to be compatible with pre-1.38 databases */

function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    if (doc._id.indexOf("messages.json") === -1) {
      return
    }
    var localeCode = doc._id.replace("/messages.json", "");
    if (localeCode.indexOf("/") > -1) {
      localeCode = localeCode.substring(localeCode.lastIndexOf("/"));
    }
    localeCode = localeCode.replace(/[^a-z-]/g, "").toLowerCase();
    if (!localeCode || localeCode.length < 2) {
      localeCode = "default";
    }
    emit(localeCode, doc);

  } catch (e) {
    //emit(e, 1);
  }
}
