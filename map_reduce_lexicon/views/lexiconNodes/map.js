function lexiconNodes(doc) {
  var debugMode = true;
  var conservativeTokenizer = {
    delimiter: " ",
    pattern: /\s+/g,
    collapseCase: false,
    removeSententialPunctuation: false,
    punctuationToRemoveAfterTokenization: null
  };
  /* Assumes
   * - no capitals (eg. D or T for retroflex or R for uvular) as contrastive segments
   * - nor long vowels written as :
   * - nor numbers representing pharingeals
   * - nor ? representing glottal stop
   */
  var aggressiveTokenizer = {
    delimiter: " ",
    pattern: /\s+/g,
    collapseCase: false,
    removeSententialPunctuation: true,
    punctuationToRemoveAfterTokenization: /[#!.,;:“\“\”\“\"\/\(\)\*\#0-9]+/g
  };
  /* Uses the Agressive tokenizer but also attempts to guess whether
   * - there are contrastive capital letters
   * - there are long vowels written with :
   * - there are palatals or ejectives written as '
   * - there are numbers used as pharyngeals
   */
  var adaptiveTokenizer = JSON.parse(JSON.stringify(aggressiveTokenizer));
  var morphemeWordAgnosticTokenizer = {
    delimiter: " ",
    pattern: /[-=\s]+/g,
    collapseCase: false,
    removeSententialPunctuation: true,
    punctuationToRemoveAfterTokenization: null
  };

  var tokenize = function(value, tokenizer) {
    if (!value) {
      return [];
    }
    value = value + "";
    // Use Agressive tokenizer by default
    if (!tokenizer) {
      tokenizer = aggressiveTokenizer;
    }
    if (tokenizer.collapseCase) {
      value = value.toLocaleLowerCase();
    }
    var tokens = [];
    value.replace(tokenizer.pattern, tokenizer.delimiter).trim().split(tokenizer.delimiter).map(function(token) {
      if (tokenizer.punctuationToRemoveAfterTokenization) {
        token = token.replace(tokenizer.punctuationToRemoveAfterTokenization, "");
      }
      token = token.trim();
      if (tokenizer.removeSententialPunctuation) {
        token = token.replace(/[.,;!\“\“\"\)\]\}]$/g, "").replace(/^[\“\“\",.;\(\[\{]/g, "");
      }
      if (token) {
        tokens.push(token);
      }
    });
    return tokens;
  };

  var flagDocForCleaning = function(doc, words, potentiallyUnmatchedIGT) {
    emit({
      error: "This datum might need cleaning, one or more of the lines has more 'words' than it should for an IGT"
    }, {
      reason: {
        fieldwhichHasMoreUnitsThanExpected: potentiallyUnmatchedIGT.length,
        expectedUnits: words.length
      },
      potentiallyInaccurateData: words,
      id: doc._id
    });
  };

  var alignIGT = function(igt) {
    if (!igt) {
      return;
    }
    // console.log("Aligning words ", igt);
    var mostWords = igt.morphemes || igt.gloss || igt.context;
    mostWords = mostWords.length;
    if (!mostWords) {
      console.log("missing an igt line that make sense.");
      return;
    }
    var words = [],
      wordIndex,
      fieldLabel,
      potentiallyUnmatchedIGT = {
        size: 0
      },
      previousContext;

    // Count through the expected numer of words
    for (wordIndex = 0; wordIndex < mostWords; wordIndex++) {
      // Get the corresponding item in IGT tiers
      console.log("aligning ", igt);
      for (fieldLabel in igt) {
        if (!igt.hasOwnProperty(fieldLabel) || extendedContextFields.indexOf(fieldLabel) > -1) {
          continue;
        }
        words[wordIndex] = words[wordIndex] || {};
        // Detect if this row has more words than we are expecting
        words[wordIndex][fieldLabel] = igt[fieldLabel][wordIndex] || "";
        if (igt[fieldLabel].length > mostWords) {
          if (extendedContextFields.indexOf(fieldLabel) === -1) {
            potentiallyUnmatchedIGT[fieldLabel] = igt[fieldLabel];
            potentiallyUnmatchedIGT[fieldLabel].missing = wordIndex;
            words[wordIndex]["confidence"] = words[wordIndex]["confidence"] || 1;
            words[wordIndex]["confidence"] = words[wordIndex]["confidence"] * 0.5;
          }
        } else {
          words[wordIndex]["confidence"] = 1;
        }
      }
      if (igt.context[wordIndex]) {
        words[wordIndex].context = igt.context[wordIndex];
        previousContext = igt.context[wordIndex];
      } else {
        words[wordIndex].context = previousContext;
      }
    }
    // console.log("IGT alignd ", words);
    if (potentiallyUnmatchedIGT.size) {
      flagDocForCleaning(doc, words, potentiallyUnmatchedIGT);
    }
    return words;
  };

  var alignMorphemes = function(words) {
    var wordIndex,
      fieldLabel,
      morphemes = [],
      igt;

    for (wordIndex = 0; wordIndex < words.length; wordIndex++) {
      igt = words[wordIndex];
      // Tokenize the IGT lines, re-align them
      console.log("tokenizing on ", igt);
      for (fieldLabel in igt) {
        if (!igt.hasOwnProperty(fieldLabel) || fieldLabel === "confidence") {
          continue;
        }
        // console.log(" before", 
        igt[fieldLabel] = tokenize(igt[fieldLabel], morphemeWordAgnosticTokenizer);
        // console.log(" tokenized", igt[fieldLabel]);
      }

      console.log(" tokenized", igt);
      morphemes.push({
        morphemes: "@"
      });
      morphemes = morphemes.concat(alignIGT(igt));
    }
    morphemes.push({
      morphemes: "@"
    });
    return morphemes;
  };
  var extendedContextFields = ["context", "utterance", "orthography", "translation"];
  var extendedIGTFields = ["morphemes", "gloss", "allomorphs", "phonetic", "ipa", "utterance", "orthography"];
  var extractLexicalEntries = function(doc) {
    if (!doc.session) {
      emit({
        error: "non-datum"
      }, doc._id);
      return;
    }
    var fields = doc.fields || doc.datumFields;
    if (!fields || !fields.length) {
      return;
    }

    var datum = {},
      fieldLabel,
      field,
      key,
      isEmpty = true;

    // console.log(" extracting IGT fields from  ", fields);
    for (key = 0; key < fields.length; key++) {
      field = fields[key];
      if (field.id && field.id.length > 0) {
        fieldLabel = field.id; /* update to version 2.35+ */
      } else {
        fieldLabel = field.label;
      }

      // If the Judgement or utterance contains a '*', discard the datum
      if (fieldLabel === "judgement" || fieldLabel === "utterance") {
        if (field.mask) {
          field.mask = field.mask.trim();
          if (field.mask[0] === "*" || field.mask[0] === "#" || field.mask[0] === "?") {
            return;
          }
        }
      }

      // If its the gloss line, leave - and . punctuation and case sensitive
      if (fieldLabel === "gloss") {
        field.tokenizer = conservativeTokenizer;
      } else if (field.mask && field.type === "IGT") {
        extendedIGTFields.push(fieldLabel);
      }

      // Tokenize the line
      if (field.mask && extendedIGTFields.indexOf(fieldLabel) > -1) {
        field.mask = field.mask.trim();
        datum[fieldLabel] = tokenize(field.mask, field.tokenizer);
        if (datum[fieldLabel].length) {
          isEmpty = false;
        }
      } else {
        console.log("Skipping field ", field);
      }
    }
    if (!datum.context) {
      datum.context = datum.utterance || datum.orthography;
      delete datum.utterance;
      delete datum.orthography;
    }

    if (isEmpty) {
      console.log("effectively empty ", datum);
      return;
    }

    var morphemes = alignMorphemes(alignIGT(datum));
    console.log(" morphemes", morphemes);

    return morphemes;
  };


  var processDocument = function(doc) {
    //  // DEBUG console.log("Processing doc " + doc._id);
    try {
      if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
        console.log("Not looking for lexical entries in deleted data");
        return;
      }
      var lexicalEntries = extractLexicalEntries(doc);
      if (!lexicalEntries) {
        console.log("No lexical entries were found in this doc" + doc._id);
        return;
      }
      lexicalEntries.map(function(lexicalEntry) {
        if (lexicalEntry.morphemes === "@") {
          return;
        }
        var context = lexicalEntry.context;
        delete lexicalEntry.context;
        emit(lexicalEntry, context);
      });

    } catch (error) {
      emit(" error" + error, doc._id);
    }
  };
  processDocument(doc);

}
try {
  exports.lexiconNodes = lexiconNodes;
} catch (e) {
  // console.log("not in a node context")
}
