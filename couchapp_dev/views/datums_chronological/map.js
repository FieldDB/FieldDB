/* updated to be compatible with pre-1.38 databases */

function(doc) {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
    if (doc.collection == "datums" || (doc.datumFields && doc.session)) {
        var dateEntered = doc.dateEntered;
        if (dateEntered) {
            try {
                dateEntered = dateEntered.replace(/"/g, "");
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
        emit(dateEntered, doc);
    }
}
