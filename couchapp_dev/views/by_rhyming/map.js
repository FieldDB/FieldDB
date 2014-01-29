function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
    // If the document is a Datum
    if (doc.audioVideo) {
      // Loop over all its DatumFields
      for (var key in doc.datumFields) {
        // If the DatumField contains the Judgement
        if (doc.datumFields[key].label == 'judgement') {
          // If the Judgement contains a '*', don't count the
          // words in it
          if (doc.datumFields[key].mask && doc.datumFields[key].mask.indexOf('*') >= 0) {
            return;
          }
          break;
        }
      }
      // Loop over all its DatumFields
      for (var key in doc.datumFields) {
        // If the DatumField contains the Utterance
        if (doc.datumFields[key].label == 'utterance') {
          // Trim whitespace
          var utterance = doc.datumFields[key].mask ? doc.datumFields[key].mask.trim() : "";
          // If the utterance is ungrammatical, don't count the
          // words in it
          if (utterance.indexOf('*') == 0) {
            return;
          }
          // Tokenize the utterance
          var words = utterance.toLowerCase().split(/[#?!.,\/ -]+/);
          // For each token
          for (var word in words) {
            // If the token it not null or the empty string
            if (words[word]) {
              // Replace (*_) with ''
              var feederWord = words[word].replace(/\(\*[^)]*\)/g, '');
              // Replace *(_) with _
              feederWord = feederWord.replace(/\*\(([^)]*)\)/, '$1');
              // Remove all parentheses and *
              var fullWord = feederWord.replace(/[(*)]/g, '');
              // Remove parentheses and all characters between the
              // parentheses
              var option1 = feederWord.replace(/\([^)]*\)/g, '');
              // If those two removals ended up with difference
              // strings
              if (fullWord != option1) {
                // Emit the version without the characters between
                // the parentheses
                emit([option1.split('').reverse().join(''), option1], 1);
              }
              // Emit the version without parentheses
              emit([fullWord.split('').reverse().join(''), fullWord], 1);
            }
          }
        }
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
