function morphemesPrecedenceContext(doc) {
  // var conservativeTokenizer = {
  //   delimiter: " ",
  //   pattern: /\s+/g,
  //   collapseCase: false,
  //   removeSententialPunctuation: true,
  //   punctuationToRemoveAfterTokenization: null
  // };
  // /* Assumes
  //  * - no capitals (eg. D or T for retroflex or R for uvular) as contrastive segments
  //  * - nor long vowels written as :
  //  * - nor numbers representing pharingeals
  //  * - nor ? representing glottal stop
  //  */
  // var aggressiveTokenizer = {
  //   delimiter: " ",
  //   pattern: /\s+/g,
  //   collapseCase: false,
  //   removeSententialPunctuation: true,
  //   punctuationToRemoveAfterTokenization: /[#!.,;:“\“\”\“\"\/\(\)\*\#0-9]+/g
  // };
  // /* Uses the Agressive tokenizer but also attempts to guess whether
  //  * - there are contrastive capital letters
  //  * - there are long vowels written with :
  //  * - there are palatals or ejectives written as '
  //  * - there are numbers used as pharyngeals
  //  */
  // var adaptiveTokenizer = JSON.parse(JSON.stringify(aggressiveTokenizer));
  // var morphemeWordAgnosticTokenizer = {
  //   delimiter: " ",
  //   pattern: /[\-=\s]+/g,
  //   collapseCase: false,
  //   removeSententialPunctuation: true,
  //   punctuationToRemoveAfterTokenization: null
  // };

  // var tokenize = function(value, tokenizer) {
  //   if (!value) {
  //     return [];
  //   }
  //   value = value + "";
  //   // Use Agressive tokenizer by default
  //   if (!tokenizer) {
  //     tokenizer = aggressiveTokenizer;
  //   }
  //   if (tokenizer.collapseCase) {
  //     value = value.toLocaleLowerCase();
  //   }
  //   var tokens = [];
  //   value.replace(tokenizer.pattern, tokenizer.delimiter).trim().split(tokenizer.delimiter).map(function(token) {
  //     if (tokenizer.punctuationToRemoveAfterTokenization) {
  //       token = token.replace(tokenizer.punctuationToRemoveAfterTokenization, "");
  //     }
  //     token = token.trim();
  //     if (tokenizer.removeSententialPunctuation) {
  //       token = token.replace(/[.,;!”\“\“\"\)\]\}\-]$/g, "").replace(/^[”\-\“\“\",.;\(\[\{]/g, "");
  //     }
  //     if (token) {
  //       tokens.push(token);
  //     }
  //   });
  //   return tokens;
  // };

  // var flagDocForCleaning = function(doc, words, potentiallyUnmatchedIGT) {
  //   emit({
  //     error: "This datum might need cleaning, one or more of the lines has more 'words' than it should for an IGT"
  //   }, {
  //     reason: {
  //       fieldwhichHasMoreUnitsThanExpected: potentiallyUnmatchedIGT.length,
  //       expectedUnits: words.length
  //     },
  //     potentiallyInaccurateData: words,
  //     id: doc._id
  //   });
  // };

  // var alignIGT = function(igt) {
  //   if (!igt) {
  //     return;
  //   }
  //   // // DEBUG console.log("Aligning words ", igt);
  //   var mostWords = igt.morphemes || igt.gloss || igt.context;
  //   mostWords = mostWords.length;
  //   if (!mostWords) {
  //     // DEBUG console.log("missing an igt line that make sense.");
  //     return;
  //   }
  //   var words = [],
  //     wordIndex,
  //     fieldLabel,
  //     potentiallyUnmatchedIGT = {
  //       size: 0
  //     },
  //     previousContext = "";

  //   // Count through the expected numer of words
  //   for (wordIndex = 0; wordIndex < mostWords; wordIndex++) {
  //     // Get the corresponding item in IGT tiers
  //     // DEBUG console.log("aligning ", igt);
  //     for (fieldLabel in igt) {
  //       if (!igt.hasOwnProperty(fieldLabel) || extendedContextFields.indexOf(fieldLabel) > -1) {
  //         continue;
  //       }
  //       words[wordIndex] = words[wordIndex] || {
  //         confidence: igt.confidence || 1,
  //         fieldCount: 0
  //       };
  //       // Detect if this row has more words than we are expecting
  //       if (!igt[fieldLabel][wordIndex]) {
  //         if (extendedContextFields.indexOf(fieldLabel) === -1) {
  //           potentiallyUnmatchedIGT[fieldLabel] = igt[fieldLabel];
  //           potentiallyUnmatchedIGT[fieldLabel].size++;
  //         }
  //       } else {
  //         words[wordIndex][fieldLabel] = igt[fieldLabel][wordIndex];
  //         words[wordIndex].fieldCount++;
  //       }
  //     }
  //     if (igt.context && igt.context[wordIndex]) {
  //       words[wordIndex].context = igt.context[wordIndex];
  //       previousContext = igt.context[wordIndex];
  //     } else {
  //       words[wordIndex].context = previousContext;
  //     }
  //   }
  //   // // DEBUG console.log("IGT alignd ", words);
  //   if (potentiallyUnmatchedIGT.size) {
  //     words[wordIndex]["confidence"] = words[wordIndex]["confidence"] * words[wordIndex].fieldCount / (words[wordIndex].fieldCount + potentiallyUnmatchedIGT.size);
  //     flagDocForCleaning(doc, words, potentiallyUnmatchedIGT);
  //   }
  //   return words;
  // };

  // var alignMorphemes = function(words) {
  //   var wordIndex,
  //     fieldLabel,
  //     morphemes = [],
  //     igt;

  //   for (wordIndex = 0; wordIndex < words.length; wordIndex++) {
  //     igt = words[wordIndex];
  //     // Tokenize the IGT lines, re-align them
  //     // DEBUG console.log("tokenizing on ", igt);
  //     for (fieldLabel in igt) {
  //       if (!igt.hasOwnProperty(fieldLabel) || fieldLabel === "confidence") {
  //         continue;
  //       }
  //       // // DEBUG console.log(" before",
  //       if (fieldLabel === "gloss") {
  //         conservativeTokenizer.pattern = morphemeWordAgnosticTokenizer.pattern;
  //         igt[fieldLabel] = tokenize(igt[fieldLabel], conservativeTokenizer);
  //       } else {
  //         igt[fieldLabel] = tokenize(igt[fieldLabel], morphemeWordAgnosticTokenizer);
  //       }
  //       // // DEBUG console.log(" tokenized", igt[fieldLabel]);
  //     }

  //     // DEBUG console.log(" tokenized", igt);
  //     igt = alignIGT(igt);
  //     if (igt) {
  //       morphemes.push({
  //         morphemes: "@"
  //       });
  //       morphemes = morphemes.concat(igt);
  //     }
  //   }
  //   morphemes.push({
  //     morphemes: "@"
  //   });
  //   return morphemes;
  // };
  // var extendedContextFields = ["context", "utterance", "orthography", "translation"];
  // var extendedIGTFields = ["morphemes", "gloss", "allomorphs", "phonetic", "ipa", "utterance", "orthography", "syntacticCategory"];
  // var extractLexicalEntries = function(doc) {
  //   if (!doc.session) {
  //     emit({
  //       error: "non-datum"
  //     }, doc._id);
  //     return;
  //   }
  //   var fields = doc.fields || doc.datumFields;
  //   if (!fields || !fields.length) {
  //     return;
  //   }

  //   var datum = {
  //       confidence: 1
  //     },
  //     fieldLabel,
  //     field,
  //     key,
  //     isEmpty = true;

  //   // // DEBUG console.log(" extracting IGT fields from  ", fields);
  //   for (key = 0; key < fields.length; key++) {
  //     field = fields[key];
  //     if (field.id && field.id.length > 0) {
  //       fieldLabel = field.id; /* update to version 2.35+ */
  //     } else {
  //       fieldLabel = field.label;
  //     }

  //     // If the Judgement or utterance contains a '*', discard the datum
  //     if (fieldLabel === "judgement" || fieldLabel === "utterance") {
  //       if (field.mask) {
  //         field.mask = field.mask.trim();
  //         if (field.mask[0] === "*" || field.mask[0] === "#" || field.mask[0] === "?") {
  //           return;
  //         }
  //       }
  //     }

  //     // If its the gloss line, leave - and . punctuation and case sensitive
  //     if (fieldLabel === "gloss") {
  //       field.tokenizer = conservativeTokenizer;
  //     } else if (field.mask && field.type === "IGT") {
  //       extendedIGTFields.push(fieldLabel);
  //     }

  //     // Tokenize the line
  //     if (field.mask && extendedIGTFields.indexOf(fieldLabel) > -1) {
  //       field.mask = field.mask.trim();
  //       datum[fieldLabel] = tokenize(field.mask, field.tokenizer);
  //       if (datum[fieldLabel].length) {
  //         isEmpty = false;
  //       }
  //     } else {
  //       // DEBUG console.log("Skipping field ", field);
  //     }
  //   }
  //   // Use morphemes if utterance wasn't provided
  //   if (datum.morphemes && !datum.utterance) {
  //     datum.utterance = datum.morphemes.map(function(morpheme) {
  //       return morpheme.replace(/-=/g, "");
  //     });
  //   }
  //   // Move utterance or othography into context per word
  //   if (!datum.context) {
  //     datum.context = datum.utterance || datum.orthography;
  //     delete datum.utterance;
  //     delete datum.orthography;
  //   }

  //   if (isEmpty) {
  //     // DEBUG console.log("effectively empty ", datum);
  //     return;
  //   }
  //   var morphemes = alignMorphemes(alignIGT(datum));
  //   // DEBUG console.log(" morphemes", morphemes);

  //   return morphemes;
  // };


  // var processDocument = function(doc) {
  //   //  // DEBUG // DEBUG console.log("Processing doc " + doc._id);
  //   try {
  //     if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
  //       // DEBUG console.log("Not looking for lexical entries in deleted data");
  //       return;
  //     }
  //     var lexicalEntries = extractLexicalEntries(doc);
  //     if (!lexicalEntries) {
  //       // DEBUG console.log("No lexical entries were found in this doc" + doc._id);
  //       return;
  //     }
  //     var previousLexicalEntry;
  //     lexicalEntries.map(function(lexicalEntry) {
  //       if (lexicalEntry && !previousLexicalEntry) {
  //         previousLexicalEntry = lexicalEntry;
  //         return;
  //       }
  //       if (!lexicalEntry || !previousLexicalEntry) {
  //         return;
  //       }
  //       // what to do about empty entries?
  //       if (!lexicalEntry.gloss && !lexicalEntry.morphemes) {
  //         previousLexicalEntry = lexicalEntry;
  //         return;
  //       }
  //       if (lexicalEntry.gloss === "?" || lexicalEntry.gloss === "??") {
  //         lexicalEntry.gloss = "";
  //       }
  //       if (previousLexicalEntry.morphemes === "@" && lexicalEntry.morphemes === "@") {
  //         previousLexicalEntry = lexicalEntry;
  //         return;
  //       }
  //       if (!lexicalEntry.fieldCount || lexicalEntry.fieldCount < 2) {
  //         previousLexicalEntry = lexicalEntry;
  //         return;
  //       }

  //       emit(previousLexicalEntry.morphemes +
  //         "|" + (previousLexicalEntry.gloss ? previousLexicalEntry.gloss : "") +
  //         "-" +
  //         lexicalEntry.morphemes +
  //         "|" + (lexicalEntry.gloss ? lexicalEntry.gloss : ""),
  //         lexicalEntry.context || previousLexicalEntry.context);
  //       previousLexicalEntry = lexicalEntry;
  //     });

  //   } catch (error) {
  //     // DEBUG console.log(error.stack);
  //     emit({
  //       error: "" + error,
  //       stack: error.stack
  //     }, doc._id);
  //   }
  // };
  // processDocument(doc);

}
try {
  exports.morphemesPrecedenceContext = morphemesPrecedenceContext;
} catch (e) {
  // // DEBUG console.log("not in a node context")
}
