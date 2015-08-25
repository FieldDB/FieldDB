function(doc) {

  var convertDatumIntoSimpleObject = function(datum) {
    var obj = {},
      fieldKeyName = "label";

    for (var i = 0; i < datum.datumFields.length; i++) {
      if (datum.datumFields[i].id && datum.datumFields[i].id.length > 0) {
        fieldKeyName = "id"; /* update to version 2.35+ */
      } else {
        fieldKeyName = "label";
      }
      if (datum.datumFields[i].mask) {
        obj[datum.datumFields[i][fieldKeyName]] = datum.datumFields[i].mask;
      }
    }
    if (datum.session.sessionFields) {
      for (var j = 0; j < datum.session.sessionFields.length; j++) {
        if (datum.session.sessionFields[j].id && datum.session.sessionFields[j].id.length > 0) {
          fieldKeyName = "id"; /* update to version 2.35+ */
        } else {
          fieldKeyName = "label";
        }
        if (datum.session.sessionFields[j].mask) {
          obj[datum.session.sessionFields[j][fieldKeyName]] = datum.session.sessionFields[j].mask;
        }
      }
    }
    obj.utterance = obj.utterance || "";
    obj.morphemes = obj.morphemes || "";
    obj.gloss = obj.gloss || "";

    return obj;
  };


  var convertDatumIntoIGT = function(datum) {
    var context = {},
      feederWord,
      fullWord;
    if (datum.judgement && datum.judgement.indexOf("*") >= 0) {
      return;
    }
    if (datum.utterance && datum.utterance.indexOf("*") >= 0) {
      return;
    }
    var words = datum.utterance.toLowerCase().replace(/#?!.,\//g, "").split(/[ ]+/);
    for (var word in words) {
      // If the token it not null or the empty string
      if (words[word]) {
        // Replace (*_) with ""
        feederWord = words[word].replace(/\(\*[^)]*\)/g, "");
        // Replace *(_) with _
        feederWord = feederWord.replace(/\*\(([^)]*)\)/, "$1");
        // Remove all parentheses and *
        fullWord = feederWord.replace(/[(*)]/g, "");
        words[word] = fullWord;
      }
    }
    context.words = words;

    var morphemes = datum.morphemes.replace(/#!,\//g, "").split(/[ ]+/);
    for (var morphemegroup in morphemes) {
      // If the token it not null or the empty string
      if (morphemes[morphemegroup]) {
        // Replace (*_) with ""
        feederWord = morphemes[morphemegroup].replace(/\(\*[^)]*\)/g, ""); // DONT replace ? it is used to indicate uncertainty with the data, . is used for fusional morphemes Replace *(_) with _ feederWord = feederWord.replace(/\*\(([^)]*)\)/, "$1");
        // Remove all parentheses and *
        fullWord = feederWord.replace(/[(*)]/g, "");
        morphemes[morphemegroup] = fullWord;
      }
    }
    context.morphemes = morphemes;

    var glosses = datum.gloss.replace(/#!,\//g, "").split(/[ ]+/); // DONT replace
    // ? it is
    // used to indicate
    // uncertainty with the
    // data, . is used for
    // fusional morphemes
    for (var glossgroup in glosses) {
      // If the token it not null or the empty string
      if (glosses[glossgroup]) {
        // Replace (*_) with ""
        feederWord = glosses[glossgroup].replace(/\(\*[^)]*\)/g, "");
        // Replace *(_) with _
        feederWord = feederWord.replace(/\*\(([^)]*)\)/, "$1");
        // Remove all parentheses and *
        fullWord = feederWord.replace(/[(*)]/g, "");
        glosses[glossgroup] = fullWord;
      }
    }
    context.glosses = glosses;

    return context;
  };

  try {

    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    // If the document is a Datum
    if (!doc.audioVideo) {
      return;
    }

    var datum = convertDatumIntoSimpleObject(doc);
    if (!datum) {
      return;
    }
    var context = convertDatumIntoIGT(datum);
    if (!context) {
      return;
    }
    var punctuationToRemove = /[#?!.|,\/\(\)\*\#0-9]/g;
    // Build triples
    for (var j in context.words) {
      var w = context.words[j] || "";
      var morphemesInUtterance = context.morphemes[j].split('-');
      var gs = context.glosses[j].split('-');
      for (var i in morphemesInUtterance) {
        var morphemeToEmit = morphemesInUtterance[i] ? morphemesInUtterance[i].toLowerCase() : "";
        morphemeToEmit = morphemeToEmit.replace(punctuationToRemove, " ").trim()
        w = w.replace(punctuationToRemove, " ").trim();
        if (morphemeToEmit) {
          emit(morphemeToEmit, w);
        }
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
