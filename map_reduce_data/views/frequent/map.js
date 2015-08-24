function frequent(doc) {
  var uppercaseFirstLetter = function(txt) {
    if (!txt || !txt.length) {
      return;
    }
    return txt.charAt(0).toUpperCase() + txt.substr(1);
  };

  var emitNonNullFields = function(field) {
    if (field && field.mask) {
      var key = field.id || field.label;
      if (!field.readonly && field.mask) {
        emit(uppercaseFirstLetter(key), doc._id);
      }
    }
  };

  var emitTags = function(tags) {
    if (tags) {
      tags = tags.replace(/ be/g, "Be").replace(/ to/g, "To").replace(/ checked/g, "Checked").replace(/&nbsp;/g, " ");
      var processedTags = tags.split(/[, ]/);
      for (var state in processedTags) {
        var tag = processedTags[state];
        tag = tag.replace(/[,!@#$%^&*()]/g, "").trim();
        if (tag) {
          tag = tag.replace(/\w\S*/g, uppercaseFirstLetter);
          emit(tag, doc._id);
        }
      }
    }
  }

  var processFields = function(fields) {
    if (!fields || !fields.length) {
      return;
    }
    var fieldIndex,
      label;
    // Data post 2.x
    for (fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
      label = fields[fieldIndex].id || fields[fieldIndex].label;
      if (fields[fieldIndex].type === "tags" ||
        label === "tags" ||
        label === "validationStatus") {
        emitTags(fields[fieldIndex].mask);
      } else {
        emitNonNullFields(fields[fieldIndex]);
      }
    }
  };

  var processDocument = function(doc) {
    try {
      /* if this document has been deleted, the ignore it and return immediately */
      if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
        return;
      }
      if (doc.results) {
        //  // DEBUG console.log(" indexing the results");
        for (var resultIndex = 0; resultIndex < doc.results.length; resultIndex++) {
          processDocument(doc.results[resultIndex]);
        };
        // return;
      }

      var fields = doc.fields || doc.datumFields;
      processFields(fields);

    } catch (error) {
      emit(" error" + error, 1);
    }
  }
  processDocument(doc);

}

try {
  exports.frequent = frequent;
} catch (e) {
  //  // DEBUG console.log("not in a node context")
}
