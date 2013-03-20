function(doc) {
  /* if this document has been deleted, the ignore it and return immediately */
  if(doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
  // If the document is a Datum
  if (doc.audioVideo) {
    // Loop over all its DatumFields
    for ( var key in doc.datumFields) {
      // If the DatumField contains the Judgement
      if (doc.datumFields[key].label == 'judgement') {
        // If the Judgement contains a '*', don't count the words in it
        if (doc.datumFields[key].mask.indexOf('*') >= 0) {
          return;
        }
        break;
      }
    }
    var context = {};
    // Loop over all its DatumFields
    for ( var key in doc.datumFields) {
      // If the DatumField contains the Utterance
      if (doc.datumFields[key].label == 'utterance') {
        // Trim whitespace
        var utterance = doc.datumFields[key].mask.trim();
        // If the utterance is ungrammatical, don't count the words in it
        if (utterance.indexOf('*') == 0) {
          return;
        }
        if (utterance == '') {
          return;
        }
        // Tokenize the utterance
        var words = utterance.toLowerCase().replace(/#?!.,\//g, '').split(
            /[ ]+/);
        for ( var word in words) {
          // If the token it not null or the empty string
          if (words[word]) {
            // Replace (*_) with ''
            var feederWord = words[word].replace(/\(\*[^)]*\)/g, '');
            // Replace *(_) with _
            feederWord = feederWord.replace(/\*\(([^)]*)\)/, '$1');
            // Remove all parentheses and *
            var fullWord = feederWord.replace(/[(*)]/g, '');
            words[word] = fullWord;
          }
        }
        context.words = words;
      }
      if (doc.datumFields[key].label == 'morphemes') {
        // Trim whitespace
        var morphemesline = doc.datumFields[key].mask.trim();
        // Tokenize the morphemes
        var morphemes = morphemesline.replace(/#!,\//g, '').split(/[ ]+/);
        for ( var morphemegroup in morphemes) {
          // If the token it not null or the empty string
          if (morphemes[morphemegroup]) {
            // Replace (*_) with ''
            var feederWord = morphemes[morphemegroup].replace(/\(\*[^)]*\)/g,
                '');// DONT replace ? it is used to indicate uncertainty with
            // the data, . is used for fusional morphemes
            // Replace *(_) with _
            feederWord = feederWord.replace(/\*\(([^)]*)\)/, '$1');
            // Remove all parentheses and *
            var fullWord = feederWord.replace(/[(*)]/g, '');
            morphemes[morphemegroup] = fullWord;
          }
        }
        context.morphemes = morphemes;
      }
      if (doc.datumFields[key].label == 'gloss') {
        // Trim whitespace
        var gloss = doc.datumFields[key].mask.trim();
        // Tokenize the gloss
        var glosses = gloss.replace(/#!,\//g, '').split(/[ ]+/);// DONT replace
        // ? it is used
        // to indicate
        // uncertainty
        // with the
        // data, . is
        // used for
        // fusional
        // morphemes
        for ( var glossgroup in glosses) {
          // If the token it not null or the empty string
          if (glosses[glossgroup]) {
            // Replace (*_) with ''
            var feederWord = glosses[glossgroup].replace(/\(\*[^)]*\)/g, '');
            // Replace *(_) with _
            feederWord = feederWord.replace(/\*\(([^)]*)\)/, '$1');
            // Remove all parentheses and *
            var fullWord = feederWord.replace(/[(*)]/g, '');
            glosses[glossgroup] = fullWord;
          }
        }
        context.glosses = glosses;
      }
    }
    // Build triples
    for ( var j in context.words) {
      var w = context.words[j];
      var morphemesInGloss = context.morphemes[j].split('-');
      var gs = context.glosses[j].split('-');
      for ( var i in morphemesInGloss) {
        emit([ morphemesInGloss[i] ], gs);

      }
    }
  }
}