function lexiconNodes(doc) {
  var onlyErrors = false;
  var debug = true;
  var fields;
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }

    // DEBUG console.log(" lexiconNodes ", doc);

    fields = doc.fields || doc.datumFields;
    // Only continue if the document is a Datum
    if (!fields || !doc.session || !doc.session.sessionFields) {
      if (debug) {
        emit("skipping", doc);
      }
      return;
    }

    /* =====   helper methods  ======= */
    var extendedIGTFields = ["morphemes", "gloss", "allomorphs", "phonetic", "ipa", "utterance", "orthography"];
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
      collapseCase: true,
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
      collapseCase: true,
      removeSententialPunctuation: true,
      punctuationToRemoveAfterTokenization: null
    };
    var tokenize = function(value, tokenizer) {
      if (!value) {
        return [];
      }
      value = value + "";
      // Use Agressive tokenizer by default
      if (!tokenizer){
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
    var extractDatumWithTokenizedLines = function(doc) {
      // DEBUG console.log(" extracting fields from  ", doc);

      var datum = {};
      var fields = doc.fields || doc.datumFields;

      var fieldKeyName = "label";

      // Extract datum level and word level tokens
      for (var key = 0; key < fields.length; key++) {
        if (fields[key].id && fields[key].id.length > 0) {
          fieldKeyName = "id"; /* update to version 2.35+ */
        } else {
          fieldKeyName = "label";
        }

        if (fields[key][fieldKeyName] === "judgement" || fields[key][fieldKeyName] === "utterance") {
          // If the Judgement or utterance contains a '*', discard the datum
          if (fields[key].mask && fields[key].mask.search(/[#*]/) >= 0) {
            if (debug) {
              emit("skipping ungrammatical example " + doc._id, fields[key]);
            }
            return;
          }
        }
        // if its the gloss line, leave - and . punctuation and case sensitive
        if (fields[key][fieldKeyName] === "gloss") {
          fields[key].mask = fields[key].mask.trim();
          fields[key].tokenizer = aggressiveTokenizer;
        } else if (fields[key].mask) {
          fields[key].mask = fields[key].mask.trim();
          fields[key].tokenizer = aggressiveTokenizer;
          if (fields[key].igt) {
            extendedIGTFields.push(fields[key].label);
          }
        }
        if (extendedIGTFields.indexOf(fields[key][fieldKeyName]) > -1) {
          datum[fields[key][fieldKeyName]] = tokenize(fields[key].mask, fields[key].tokenizer);
        }
      }
      // DEBUG console.log("fields ", fields);
      // DEBUG console.log("datum ", datum);
      // DEBUG console.log("extendedIGTFields ", extendedIGTFields);
      return datum;
    };

    var extractLexicalEntries = function(datum) {
      // Now we can extract Word Level IGT
      var words = datum.utterance || datum.morphemes || datum.orthography || [];
      var wordLevelTuples = [];
      var wordIndex;
      var fieldLabel;
      var detectIfDatumHasUnmatchedIGT = {};
      // DEBUG console.log("words", words);

      for (wordIndex = 0; wordIndex < words.length; wordIndex++) {
        // Get the corresponding item in IGT tiers
        for (fieldLabel in datum) {
          if (!datum.hasOwnProperty(fieldLabel)) {
            continue;
          }
          if (extendedIGTFields.indexOf(fieldLabel) > -1) {
            wordLevelTuples[wordIndex] = wordLevelTuples[wordIndex] || {};
            wordLevelTuples[wordIndex][fieldLabel] = datum[fieldLabel][wordIndex];
            // Detect if this datum needs cleaning
            if (datum[fieldLabel].length > words.length) {
              detectIfDatumHasUnmatchedIGT[fieldLabel] = datum[fieldLabel];
              wordLevelTuples[wordIndex]["confidence"] = 0.5;
            } else {
              wordLevelTuples[wordIndex]["confidence"] = 1;
            }
          }
        }
      }
      // DEBUG console.log("wordLevelTuples", wordLevelTuples);

      if (Object.keys(detectIfDatumHasUnmatchedIGT).length > 0 && (debug || onlyErrors)) {
        emit({
          error: "This datum might need cleaning, one or more of the lines has more 'words' than it should for an IGT"
        }, {
          reason: {
            fieldwhichHasMoreUnitsThanExpected: detectIfDatumHasUnmatchedIGT,
            expectedUnits: words
          },
          potentiallyInaccurateData: wordLevelTuples,
          id: doc._id
        });
      }

      // Now  we can  extract Morpheme Level IGT
      var morphemeLevelTuples = [];
      var wordIndex;
      var tokenIndex;
      var keyIndex;
      var morphemeTupleIndex;
      var detectIfDatumHasUnmatchedUnSegmentedFields = {};
      var detectIfDatumHasUnmatchedIGTMorphemes = {};

      for (wordIndex in wordLevelTuples) {
        var wordIGT = wordLevelTuples[wordIndex];
        var keysWhichAreContextButNotSegmented = [];
        var morphemeTuples = [];
        for (key in wordIGT) {
          var value = wordIGT[key];
          var tokens = tokenize(value, morphemeWordAgnosticTokenizer);
          // If this is the utterance, or unsegmented field, then dont put it, instead add it to all tuples.
          if (tokens.length >= 1) {
            for (tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
              morphemeTuples[tokenIndex] = morphemeTuples[tokenIndex] || {};
              morphemeTuples[tokenIndex][key] = tokens[tokenIndex];
            }
          } else {
            keysWhichAreContextButNotSegmented.push(key);
          }
        }
        // Fill in the fields (like utterance) that dont have segmented to the other fields as context
        for (keyIndex in keysWhichAreContextButNotSegmented) {
          for (morphemeTupleIndex = 0; morphemeTupleIndex < morphemeTuples.length; morphemeTupleIndex++) {
            morphemeTuples[morphemeTupleIndex][keysWhichAreContextButNotSegmented[keyIndex]] = wordIGT[keysWhichAreContextButNotSegmented[keyIndex]];
            // DEBUG console.log("keysWhichAreContextButNotSegmented", keysWhichAreContextButNotSegmented);
          }
        }
        // Detect if any tuples are missing fields, which could indicate mis-matching segmentation
        var flagOthersAsLowConfidence = false;
        for (morphemeTupleIndex = morphemeTuples.length - 1; morphemeTupleIndex >= 0; morphemeTupleIndex--) {
          if (Object.keys(morphemeTuples[morphemeTupleIndex]).length !== Object.keys(wordIGT).length) {
            morphemeTuples[morphemeTupleIndex]["confidence"] = morphemeTuples[morphemeTupleIndex]["confidence"] ? morphemeTuples[morphemeTupleIndex]["confidence"] * 0.5 : 0.5;
            flagOthersAsLowConfidence = true;
            if (debug || onlyErrors) {
              emit({
                error: "This datum might need cleaning, one or more of the lines has more 'morphemes' than it should for an IGT"
              }, {
                reason: {
                  fieldwhichHasMoreUnitsThanExpected: "unknown",
                  expectedUnits: wordIGT
                },
                potentiallyInaccurateData: morphemeTuples[morphemeTupleIndex],
                id: doc._id
              });
            }
          } else {
            if (flagOthersAsLowConfidence) {
              morphemeTuples[morphemeTupleIndex]["confidence"] = morphemeTuples[morphemeTupleIndex]["confidence"] ? morphemeTuples[morphemeTupleIndex]["confidence"] * 0.9 : 0.9;
            }
          }
        }
        // If part of the morpheme had a segmentation, keep track of the unsegmented fields in case word show uneven segmentation
        if (keysWhichAreContextButNotSegmented.length !== Object.keys(wordIGT).length) {
          detectIfDatumHasUnmatchedUnSegmentedFields[keysWhichAreContextButNotSegmented.join()] = detectIfDatumHasUnmatchedUnSegmentedFields[keysWhichAreContextButNotSegmented.join()] || [];
          detectIfDatumHasUnmatchedUnSegmentedFields[keysWhichAreContextButNotSegmented.join()].push(wordIGT);
        }
        morphemeLevelTuples.push({
          "morphemes": "@",
          "confidence": 1
        });
        morphemeLevelTuples = morphemeLevelTuples.concat(morphemeTuples);
      }
      morphemeLevelTuples.push({
        "morphemes": "@",
        "confidence": 1
      });

      // Detect if this datum needs cleaning because some of the fields probably should be missing segmentation
      var countOfUnsegmentedFields = Object.keys(detectIfDatumHasUnmatchedUnSegmentedFields).length;
      if (countOfUnsegmentedFields > 1) {
        for (morphemeTupleIndex = 0; morphemeTupleIndex < morphemeLevelTuples.length; morphemeTupleIndex++) {
          morphemeLevelTuples[morphemeTupleIndex]["confidence"] = morphemeLevelTuples[morphemeTupleIndex]["confidence"] ? parseFloat(morphemeLevelTuples[morphemeTupleIndex]["confidence"], 10) * 0.9 : 0.91;
        }
        if (debug || onlyErrors) {
          emit({
            error: "This datum needs cleaning, some of its IGT fields which are segmented in other words, are missing segmentation in one or more words"
          }, {
            reason: detectIfDatumHasUnmatchedUnSegmentedFields,
            potentiallyInaccurateData: morphemeLevelTuples,
            id: doc._id
          });
        }
      }
      // DEBUG console.log(morphemeLevelTuples);
      return morphemeLevelTuples;
    };

    /* =======  end helper methods  ======= */

    /* main */
    var datum = extractDatumWithTokenizedLines(doc);
    if (!datum) {
      return;
    }
    var lexicalEntries = extractLexicalEntries(datum, doc._id);

    var context = datum.context || datum.utterance || datum.orthography || "";
    lexicalEntries.map(function(lexicalEntry) {
      if (lexicalEntry.orthography) {
        context = lexicalEntry.orthography;
      }
      if (lexicalEntry.utterance) {
        context = lexicalEntry.utterance;
      }
      delete lexicalEntry.utterance;
      delete lexicalEntry.orthography;

      // DEBUG console.log(lexicalEntry);
      emit(lexicalEntry, context);
    });

    // emitPrecedenceRules(datum, emit);

  } catch (e) {
    if (debug || onlyErrors) {
      // DEBUG console.log(e.stack);
      emit(e || "error", 1);
    }
  }
};
try {
  exports.lexiconNodes = lexiconNodes;
} catch (e) {
  //  // DEBUG console.log("not in a node context")
}
