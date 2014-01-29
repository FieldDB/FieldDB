function(doc) {
	try {
		if (doc.collection == "activities" || doc.directobject) {
			emit(doc._id, doc);
		}
	} catch (e) {
		//emit(e, 1);
	}
};
