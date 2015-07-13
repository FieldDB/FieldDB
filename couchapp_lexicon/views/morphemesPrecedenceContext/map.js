function(doc) {
  var onlyErrors = false;
  var debug = false;
  var maxDistance = 1;
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    // Only continue if the document is a Datum
    if (!doc.datumFields || !doc.session || !doc.session.sessionFields) {
      if (debug) {
        emit("skipping", doc);
      }
      return;
    }

    /* =====   helper methods  ======= */
    var extendedIGTFields = ["utterance", "orthography", "gloss", "morphemes", "allomorphs", "phonetic", "ipa"];
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
      if (tokenizer.collapseCase) {
        value = value.toLocaleLowerCase();
      }
      var tokens = [];
      value.replace(tokenizer.pattern, tokenizer.delimiter).trim().split(tokenizer.delimiter).map(function(token) {
        if (tokenizer.punctuationToRemoveAfterTokenization) {
          token = token.replace(tokenizer.punctuationToRemoveAfterTokenization, '');
        }
        token = token.trim();
        if (tokenizer.removeSententialPunctuation) {
          token = token.replace(/[.,;!\“\“\"\)\]\}]$/g, '').replace(/^[\“\“\",.;\(\[\{]/g, '');
        }
        if (token) {
          tokens.push(token);
        }
      });
      return tokens;
    };
    var extractFieldValues = function(doc) {



      var datumFieldsForDatumLevelContext = {};
      var datumFieldsForWordLevelContext = {};
      var datumFieldsForMorphemeLevelContext = {};
      var key;
      var fields = doc.datumFields.concat(doc.session.sessionFields);



      // Extract datum level and word level tokens
      for (key = 0; key < fields.length; key++) {
        if (fields[key].label === 'judgement' || fields[key].label === 'utterance') {
          // If the Judgement or utterance contains a '*', discard the datum
          if (fields[key].mask && fields[key].mask.search(/[#*]/) >= 0) {
            if (debug) {
              emit("skipping", fields);
            }
            return;
          }
        }
        // if its the gloss line, leave - and . punctuation and case sensitive
        if (fields[key].label === 'gloss') {
          fields[key].tokenizer = aggressiveTokenizer;
        }
        if (fields[key].mask) {
          fields[key].mask = fields[key].mask.trim();
          datumFieldsForDatumLevelContext[fields[key].label] = fields[key].mask;
          datumFieldsForWordLevelContext[fields[key].label] = tokenize(fields[key].mask, fields[key].tokenizer ? fields[key].tokenizer : aggressiveTokenizer);
          if (fields[key].igt) {
            extendedIGTFields.push(fields[key].label);
          }
        }
      }
      if (doc.comments && doc.comments.length > 0) {
        datumFieldsForDatumLevelContext.comments = JSON.stringify(doc.comments);
      }
      datumFieldsForDatumLevelContext.id = doc._id;


      // Now we can extract Word Level IGT
      var words = datumFieldsForWordLevelContext.utterance || datumFieldsForWordLevelContext.morphemes || datumFieldsForWordLevelContext.orthography || [];
      var wordLevelTuples = [];
      var word;
      var detectIfDatumHasUnmatchedIGT = {};
      for (word in words) {
        // Get the corresponding item in IGT tiers
        for (key in datumFieldsForWordLevelContext) {
          if (datumFieldsForWordLevelContext.hasOwnProperty(key)) {
            if (extendedIGTFields.indexOf(key) > -1) {
              wordLevelTuples[word] = wordLevelTuples[word] || {};
              wordLevelTuples[word][key] = datumFieldsForWordLevelContext[key][word];
              // Detect if this datum needs cleaning
              if (datumFieldsForWordLevelContext[key].length > words.length) {
                detectIfDatumHasUnmatchedIGT[key] = datumFieldsForWordLevelContext[key];
                wordLevelTuples[word]["confidence"] = 0.5;
              } else {
                wordLevelTuples[word]["confidence"] = 1;
              }
            }
          }
        }
      }
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



      return {
        datumLevelContext: datumFieldsForDatumLevelContext,
        // wordLevelContext: datumFieldsForWordLevelContext,
        // wordLevelContext: wordLevelTuples,
        morphemeLevelContext: morphemeLevelTuples
      };
    };

    var emitPrecedenceRules = function(datumInContextTiers, localemit) {
      // TODO add precedence rules

      var thisNode;
      var skippedNodes;
      var nodeIndex;
      var previousNodeIndex;
      var previousNode;
      var distance;

      if (!onlyErrors) {

        for (previousNodeIndex = 0; previousNodeIndex < datumInContextTiers.morphemeLevelContext.length - 1; previousNodeIndex++) {
          for (nodeIndex = previousNodeIndex + 1; nodeIndex < datumInContextTiers.morphemeLevelContext.length; nodeIndex++) {

            previousNode = datumInContextTiers.morphemeLevelContext[previousNodeIndex];
            thisNode = datumInContextTiers.morphemeLevelContext[nodeIndex];

            skippedNodes = [];
            while (!thisNode.morphemes) {
              if (debug || onlyErrors) {
                emit({
                  error: "Skipping this relation because one of the nodes has no morphemes"
                }, {
                  reason: {
                    relation: [previousNode, thisNode]
                  },
                  potentiallyInaccurateData: thisNode,
                  id: doc._id
                });
              }
              nodeIndex++;
              skippedNodes.push(thisNode);
              thisNode = datumInContextTiers.morphemeLevelContext[nodeIndex];
            }
            if (skippedNodes.length > 0) {
              thisNode.skippedNodes = skippedNodes;
            }
            if (thisNode.morphemes === "@" && previousNode.morphemes === "@") {
              previousNode = thisNode;
              continue;
            }
            var wordLevelContext = "";
            if (previousNode.utterance !== thisNode.utterance) {
              wordLevelContext = datumInContextTiers.datumLevelContext.utterance;
            } else {
              wordLevelContext = previousNode.utterance || thisNode.utterance;
            }
            if (!wordLevelContext) {
              if (previousNode.morphemes !== thisNode.morphemes) {
                wordLevelContext = datumInContextTiers.datumLevelContext.morphemes;
              } else {
                wordLevelContext = previousNode.morphemes || thisNode.morphemes;
              }
            }
            if (thisNode.morphemes === previousNode.morphemes && !wordLevelContext.match(new RegExp(thisNode.morphemes + ".*" + previousNode.morphemes))) {
              if (debug || onlyErrors) {
                emit({
                  error: "Skipping this relation because one of the nodes morphemes match but the utterance doesn't contain it twice"
                }, {
                  reason: {
                    relation: [previousNode, thisNode]
                  },
                  potentiallyInaccurateData: [previousNode, thisNode],
                  id: doc._id
                });
              }
              previousNode = thisNode;
              continue;
            }
            distance = nodeIndex - previousNodeIndex;
            if (distance <= maxDistance) {
              localemit({
                "previous": previousNode,
                "subsequent": thisNode,
                "relation": "precedes",
                "distance": distance,
                "context": datumInContextTiers.datumLevelContext
              }, wordLevelContext);

              // localemit({
              //   "previous": previousNode,
              //   "subsequent": thisNode,
              //   "relation": "follows",
              //   "distance": distance,
              //   "context": datumInContextTiers.datumLevelContext
              // }, wordLevelContext);
            }
            // localemit(thisNode, doc._id);
            previousNode = thisNode;

          }
        }
      }
    };
    /* =======  end helper methods  ======= */


    /* main */
    var datum = extractFieldValues(doc);
    if (!datum) {
      return;
    }
    emitPrecedenceRules(datum, emit);

  } catch (e) {
    if (debug || onlyErrors) {
      emit(e, 1);
    }
  }
}