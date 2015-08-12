function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    // If the document is a Datum
    if (!doc.audioVideo) {
      return;
    }
    var key,
      fieldKeyName,
      fields = doc.fields || doc.datumFields || [];

    // Loop over all its DatumFields
    for (key = 0; key < fields.length; key++) {
      fieldKeyName = "label";
      if (fields[key].id && fields[key].id.length > 0) {
        fieldKeyName = "id"; /* update to version 2.35+ */
      } else {
        fieldKeyName = "label";
      }
      // If the DatumField contains the Judgement
      if (fields[key][fieldKeyName] === "judgement") {
        // If the Judgement contains a "*", don"t count the words in it
        if (fields[key].mask && fields[key].mask.indexOf("*") >= 0) {
          return;
        }
        break;
      }
    }
    var processPrecedenceRules = function(word) {
      if (word === "") {
        return;
      }
      word = word.replace(/^-/, "").replace(/-$/, "");
      var morphemes = word.trim().split("-");
      var previousmorph = "@";
      if (morphemes.length === 0) {
        return;
      }
      morphemes.push("@");
      for (var morph in morphemes) {
        var rule = {};
        rule.x = previousmorph;
        rule.relation = "precedes";
        rule.y = morphemes[morph];
        rule.context = word;
        emit(rule, 1);
        previousmorph = morphemes[morph];
      }
    };
    // Loop over all its DatumFields
    for (key in fields) {
      fieldKeyName = "label";
      if (fields[key].id && fields[key].id.length > 0) {
        fieldKeyName = "id"; /* update to version 2.35+ */
      } else {
        fieldKeyName = "label";
      }
      // If the DatumField contains the Utterance
      if (fields[key][fieldKeyName] === "morphemes") {
        // Trim whitespace
        var morphemesLine = fields[key].mask ? fields[key].mask.trim() : "";
        // If the morphemesLine is ungrammatical, don"t count the words
        // in it
        if (morphemesLine.indexOf("*") === 0) {
          return;
        }
        // Tokenize the morphemesLine
        var words = morphemesLine.toLowerCase().split(/[#?!.,/ ]+/);
        // For each token
        for (var word in words) {
          // If the token it not null or the empty string
          if (words[word]) {
            // Replace (*_) with ""
            var feederWord = words[word].replace(/\(\*[^)]*\)/g, "");
            // Replace *(_) with _
            feederWord = feederWord.replace(/\*\(([^)]*)\)/, "$1");
            // Remove all parentheses and *
            var fullWord = feederWord.replace(/[(*)]/g, "");
            // Remove parentheses and all characters between the
            // parentheses
            var option1 = feederWord.replace(/\([^)]*\)/g, "");
            // If those two removals ended up with difference strings
            if (fullWord !== option1) {
              // Emit the version without the characters between the
              // parentheses
              processPrecedenceRules(option1);
            }
            // Emit the version without parentheses
            processPrecedenceRules(fullWord);
          }
        }
      }
    }
  } catch (e) {
    //emit(e, doc);
  }
}
