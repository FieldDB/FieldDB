function(doc) {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
    if ((doc.datumFields) && (doc.session)) {
        var obj = {};
        for (i = 0; i < doc.datumFields.length; i++) {
            if (doc.datumFields[i].mask && !(doc.datumFields[i].label == 'modifiedByUser')) {
                if (doc.datumFields[i].label === 'enteredByUser') {
                    obj.enteredByUser = doc.datumFields[i].mask.username;
                } else {
                    obj[doc.datumFields[i].label] = doc.datumFields[i].mask;
                }
            }
        }
        if (doc.session.sessionFields) {
            for (j = 0; j < doc.session.sessionFields.length; j++) {
                if (doc.session.sessionFields[j].mask && !(doc.session.sessionFields[j].label == 'user' ||
                    doc.session.sessionFields[j].label === 'dateSEntered')) {
                    obj[doc.session.sessionFields[j].label] = doc.session.sessionFields[j].mask;
                }
            }
        }
        emit(obj, doc._id);
    }
}