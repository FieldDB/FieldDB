// var morpheme_n_grams = function(doc, emit) {
function(doc) {
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }

    var key,
      fieldKeyName,
      fields = doc.fields || doc.datumFields || [];

    // Ignore documents without fields
    if (!fields || !fields.length) {
      return;
    }

    var maxDistance = 3;
    var wordBoundary = "@";
    var wordBoundariesRegex = /[#?!.,/\s]+/g;
    var morphemeBoundariesRegex = /[-=]+/g;
    var punctuationToRemoveAfterTokenization = /[#!.,;:“\“\”\“\"\/\(\)\*\#0-9]+/g;
    var puntuationToRemoveAtBeginning = /^[\“\“\",.;\(\[\{-]/;
    var puntuationToRemoveAtEnd = /[.,;!\“\“\"\)\]\}-]$/;

    /* =====   helper methods  ======= */

    var tokenize = function(morphemesLine) {
      ////OFF console.log("  tokenize ", morphemesLine);
      return morphemesLine.split(wordBoundariesRegex);
    };

    var cleanOptionalityConventions = function(token) {
      ////OFF console.log("  cleanOptionalityConventions ", token);

      // If the token it not null or the empty string
      if (token) {
        // Replace (*_) with ""
        var feederWord = token.replace(/\(\*[^)]*\)/g, "");
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
          return [option1, fullWord];
        }
        // Emit the version without parentheses
        return [fullWord];
      }
    };


    var emitNgrams = function emitNgrams(morphemes, ngrams, context) {
      ////OFF console.log("  emitNgrams ", morphemes, ngrams);
      if (!morphemes || !morphemes.length) {
        // console.log("    skipping  ", morphemes, ngrams);
        return;
      }
      if (!ngrams) {
        ngrams = [];
        for (var padding = 1; padding < maxDistance; padding++) {
          ngrams.push(wordBoundary);
          morphemes.push(wordBoundary);
        }
        ////OFF console.log("    padded ngrams  ", morphemes, ngrams);
      }
      var thisMorpheme = morphemes.shift();
      ngrams.push(thisMorpheme);
      if (ngrams.join("-") === -1) {
        // console.log("   itteration: " + ngrams.join("-") + " ||| " + morphemes.join("|"));
        // emit(ngrams.length, ngrams.join("-"));
        emit(ngrams.join("-"), context);
      }

      ngrams.splice(0, 1);
      /* TODO emit parts of the ngrams too */
      ////OFF console.log("  emitNgrams ngrams", ngrams);
      emitNgrams(morphemes, ngrams, context);
    };

    var processMorphemesLine = function(morphemesLine) {
      ////OFF console.log("  processMorphemesLine ", morphemesLine);
      if (!morphemesLine) {
        // DEBUG console.warn("    Skipping empty morphemesLine", morphemesLine);
        return;
      }

      // Tokenize the morphemesLine
      var uncleanedWords = tokenize(morphemesLine);
      if (!uncleanedWords || !uncleanedWords.length) {
        // DEBUG console.warn("    tokenizing yeilded no words", morphemesLine);
        return;
      }
      ////OFF console.log("    tokenized", uncleanedWords)
      // Clean the tokens
      var words = [];
      uncleanedWords.map(function(word) {
        var multiplelyEncodedOptions = cleanOptionalityConventions(word.toLocaleLowerCase());

        multiplelyEncodedOptions[0] = multiplelyEncodedOptions[0].replace(puntuationToRemoveAtBeginning, "").replace(puntuationToRemoveAtEnd, "");
        if (multiplelyEncodedOptions[0]) {
          //// console.warn("   cleaned", multiplelyEncodedOptions[0]);
          words.push(multiplelyEncodedOptions[0]);
        } else {
          // DEBUG console.warn("    one of the words was empty after cleaning", word);
        }

        if (multiplelyEncodedOptions.length > 1) {
          // DEBUG console.warn("    there was 2 utterances encoded using optionality: ", morphemesLine.replace(word, multiplelyEncodedOptions[0]));
          // DEBUG console.warn("    there was 2 utterances encoded using optionality: ", morphemesLine.replace(word, multiplelyEncodedOptions[1]));
          processMorphemesLine(morphemesLine.replace(word, multiplelyEncodedOptions[1]));
          morphemesLine = morphemesLine.replace(word, multiplelyEncodedOptions[0]);
        }
      });
      if (!words || !words.length) {
        // DEBUG console.warn("    Skipping empty morphemesLine", words);
        return;
      }
      // console.log("    tokenized, cleaned", words.join(","));

      var morphemes = (wordBoundary + "-" + words.join("-" + wordBoundary + "-") + "-" + wordBoundary).split(morphemeBoundariesRegex);
      // console.log("  processMorphemesLine result: ", morphemes.join(","));

      emitNgrams(morphemes, null, morphemesLine);

    };

    // Loop over all DatumFields
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
        if (!morphemesLine) {
          morphemesLine = fields[key].value ? fields[key].value.trim() : "";
        }
        // If the morphemesLine is ungrammatical, or empty don"t count the words
        // in this document
        if (!morphemesLine || morphemesLine.indexOf("*") === 0) {
          // DEBUG console.warn("Skipping ungrammatical/empty morphemesLine", morphemesLine);
          return;
        }
        processMorphemesLine(morphemesLine);
      }
    }
  } catch (e) {
    emit(e, doc);
  }
};

// exports.morpheme_n_grams = morpheme_n_grams;
