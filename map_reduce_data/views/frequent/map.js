function (doc) {
  var uppercaseFirstLetter = function(txt) {
    if (!txt || !txt.length) {
      return;
    }
    return txt.charAt(0).toUpperCase() + txt.substr(1);
  };

  var emitNonNullFields = function(field, type) {
    type = uppercaseFirstLetter(type);

    if (field && field.mask) {
      var key = field.id || field.label;
      if (!field.readonly && field.mask) {
        emit(type, uppercaseFirstLetter(key));
      }
    }
  };

  var emitTags = function(tags, type) {
    type = uppercaseFirstLetter(type);
    if (tags) {
      tags = tags.replace(/ be/g, "Be").replace(/ to/g, "To").replace(/ checked/g, "Checked").replace(/&nbsp;/g, " ");
      var processedTags = tags.split(/[, ]/);
      for (var state in processedTags) {
        var tag = processedTags[state];
        tag = tag.replace(/[,!@#$%^&*()]/g, "").trim();
        if (tag) {
          tag = tag.replace(/\w\S*/g, uppercaseFirstLetter);
          emit(type, tag);
        }
      }
    }
  }

  var processFields = function(fields, type) {
    if (!fields || !fields.length) {
      return;
    }
    var fieldIndex,
      label;
    // Data post 2.x
    for (fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
      label = fields[fieldIndex].id || fields[fieldIndex].label;
      if (label === "tags") {
        label = "tag";
      }
      if (fields[fieldIndex].type === "tags" ||
        label === "tag" ||
        label === "validationStatus") {
        emitTags(fields[fieldIndex].mask, label);
      } else {
        emitNonNullFields(fields[fieldIndex], type);
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
      var type = doc.fieldDBtype;
      if (type) {
        type += "Fields"
      } else {
        if (doc.session) {
          type = "DatumFields";
        } else if (!doc.datumFields && doc.sessionFields) {
          type = "SessionFields";
        } else if (doc.fields && doc.title) {
          type = "CorpusFields";
        } else if (doc.fields && !doc.title) {
          type = "ParticipantFields";
        } else if (doc.datumFields && !doc.title) {
          type = "DatumFields";
        }
      }
      processFields(fields, type);

    } catch (error) {
      emit(" error" + error, 1);
    }
  }
  processDocument(doc);

}