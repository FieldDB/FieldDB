function(doc) {
	try {
		/* if this document has been deleted, the ignore it and return immediately */
		if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
			return;
		}
		var date = doc.dateModified ? doc.dateModified.replace(/["\\]/g, '') : "";
		emit(date, doc);
	} catch (e) {
		//emit(e, 1);
	}
}
