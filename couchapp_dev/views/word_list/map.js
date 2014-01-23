function(doc) {
  /* if this document has been deleted, the ignore it and return immediately */
  if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
    return;
  }
  // If the document is a Datum
  if (doc.audioVideo) {
    // Loop over all its DatumFields
    for (var key in doc.datumFields) {
      // If the DatumField contains the Judgement
      if (doc.datumFields[key].label === 'judgement') {
        // If the Judgement contains a '*', don't count the words in it
        if (doc.datumFields[key].mask.indexOf('*') >= 0) {
          return;
        }
        break;
      }
    }
    // Loop over all its DatumFields
    for (var key in doc.datumFields) {
      // If the DatumField contains the Utterance
      if (doc.datumFields[key].label === 'utterance') {
        // Trim whitespace
        var utterance = doc.datumFields[key].mask.trim();
        // If the utterance is ungrammatical, don't count the words in it
        if (utterance.indexOf('*') === 0) {
          return;
        }
        if (utterance === '') {
          return;
        }
        // Tokenize the utterance
        var words = utterance.toLowerCase().replace(/[#?!.,\/\(\)\*\#0-9]/g, ' ').split(/[ ]+/);
        for (var word in words) {
          // If the token it not null or the empty string
          if (words[word]) {
            var suffixOrder = "";
            for(var ch = words[word].length -1; ch >= 0 ; ch-- ){
              suffixOrder = suffixOrder+words[word][ch];
            }
            emit({ word: words[word], sortThisColumnToFindSuffixes: suffixOrder }, {rhymingOrderToFindSuffixes: suffixOrder, grammaticalContexts: utterance});

          }
        }
      }
    }
  }
}
