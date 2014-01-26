/* updated to be compatible with pre-1.38 databases */
function(doc) {
	try {
		/* if this document has been deleted, the ignore it and return immediately */
		if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
		if (doc.collection == "sessions" || (doc.sessionFields && !doc.datumFields)) {
			emit(doc.dateModified, doc);
		}
	} catch (e) {
		//emit(e, 1);
	}
};
