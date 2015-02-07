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

    /* ignore ungrammatical contexts */
    if (datum.judgement && datum.judgement.indexOf("*") >= 0) {
      return;
    }
    if (datum.utterance && datum.utterance.indexOf("*") >= 0) {
      return;
    }
    /* ignore substitution options */
    if (datum.utterance && datum.utterance.indexOf("/") >= 0) {
      return;
    }
    if (!datum.utterance) {
      return;
    }
    var words = datum.utterance.trim().toLowerCase().replace(/#?!.,\//g, "").split(/[ ]+/);
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

  /**
   * http://stackoverflow.com/questions/958908/how-do-you-reverse-a-string-in-place-in-javascript
   *
   * Many solutions are broken for UTF-16 strings that contain surrogate pairs,
   * i.e. characters outside of the basic multilingual plane.
   * It will also give funny results for strings containing combining chars,
   * e.g. a diaeresis might appear on the following character.
   * The first issue will lead to invalid unicode strings,
   * the second to valid strings that look funny.
   *
   * https://mths.be/esrever v0.2.0 by @mathias
   * https://raw.githubusercontent.com/mathiasbynens/esrever/master/esrever.js
   *
   * @param  {[type]} input [description]
   * @return {[type]}       [description]
   */
  var reverseUnicodeString = function(input) {

    var regexSymbolWithCombiningMarks = /([\0-\u02FF\u0370-\u1AAF\u1B00-\u1DBF\u1E00-\u20CF\u2100-\uD7FF\uE000-\uFE1F\uFE30-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])([\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]+)/g;
    var regexSurrogatePair = /([\uD800-\uDBFF])([\uDC00-\uDFFF])/g;

    var reverse = function(string) {
      // Step 1: deal with combining marks and astral symbols (surrogate pairs)
      string = string
      // Swap symbols with their combining marks so the combining marks go first
      .replace(regexSymbolWithCombiningMarks, function($0, $1, $2) {
        // Reverse the combining marks so they will end up in the same order
        // later on (after another round of reversing)
        return reverse($2) + $1;
      })
      // Swap high and low surrogates so the low surrogates go first
      .replace(regexSurrogatePair, '$2$1');
      // Step 2: reverse the code units in the string
      var result = '';
      var index = string.length;
      while (index--) {
        result += string.charAt(index);
      }
      return result;
    };
    return reverse(input)
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

    var context = convertDatumIntoIGT(datum);
    if (!context) {
      return;
    }
    var utterance = datum.utterance;
    // Tokenize the utterance
    var punctuationToRemove = /[#?!.|,\/\(\)\*\#0-9]/g;
    var words = utterance.toLocaleLowerCase().replace(punctuationToRemove, " ").split(/[ ]+/);
    for (var word in words) {
      // If the token it not null or the empty string
      if (words[word]) {
        var suffixOrder = reverseUnicodeString(words[word]);
        emit({
          word: words[word],
          sortThisColumnToFindSuffixes: suffixOrder
        }, {
          rhymingOrderToFindSuffixes: suffixOrder,
          grammaticalContexts: utterance
        });
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
