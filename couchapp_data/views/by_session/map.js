/* updated to be compatible with pre-1.38 databases */
function(doc) {
	try {
		/* if this document has been deleted, the ignore it and return immediately */
		if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
		if (doc.fieldDBtype === "Datum" || doc.collection == "datums" || (doc.datumFields && doc.session)) {
			emit(doc.session._id, doc);
		}
	} catch (e) {
		//emit(e, 1);
	}
};
