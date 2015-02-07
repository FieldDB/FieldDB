  function(doc) {

    // if (((doc.dateModified && doc.dateModified.indexOf("2015-02-04T16") > -1) || (doc.dateModified && doc.dateModified.indexOf("2015-02-04T17") > -1))) {
    //   // emit(doc.dateModified, doc);
    //   return;
    // }

    // if (!((doc.dateModified && doc.dateModified.indexOf("2015-02-04T16") > -1) || (doc.dateModified && doc.dateModified.indexOf("2015-02-04T17") > -1)))
    //   return;


    var sanitizeKey = function(value) {
      if (!value)
        return Date.now();
      value = value.trim();
      value = encodeURIComponent(value);
      return value;

    };

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
          obj[sanitizeKey(datum.datumFields[i][fieldKeyName])] = datum.datumFields[i].mask;
        }
      }
      obj.utterance = obj.utterance || "";
      obj.morphemes = obj.morphemes || "";
      obj.gloss = obj.gloss || "";

      //Dont try to find words if the utterance has / in it
      if (obj.utterance.indexOf("/") > -1) {
        return;
      }
      if (obj.utterance.indexOf("}") > -1) {
        return;
      }
      return obj;
    };

    var convertDatumIntoIGT = function(datum) {
      var context = {},
        feederWord,
        fullWord;
      if (datum.judgement && datum.judgement.indexOf("*") >= 0) {
        return;
      }
      if (datum.utterance && datum.utterance.indexOf("*") >= 0) {
        return;
      }
      if (!datum.utterance) {
        return;
      }
      var words = datum.utterance.toLowerCase().replace(/ \/ /g, "/").replace(/#?!.,\//g, "").split(/[ ]+/);
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

      // emit(context, 1)

      return context;
    };

    /*  http://stackoverflow.com/questions/958908/how-do-you-reverse-a-string-in-place-in-javascript
      Must avoid this being broken for UTF-16 strings that contain surrogate pairs,
      i.e. characters outside of the basic multilingual plane.
      It will also give funny results for strings containing combining chars,
      e.g. a diaeresis might appear on the following character.
      The first issue will lead to invalid unicode strings,
      the second to valid strings that look funny.

      https://mths.be/esrever v0.2.0 by @mathias
      https://raw.githubusercontent.com/mathiasbynens/esrever/master/esrever.js
     */
    function reverseUnicodeString(input) {

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
      if (!datum) {
        return;
      }
      var context = convertDatumIntoIGT(datum);
      if (!context) {
        return;
      }
      var utterance = datum.utterance;
      // Tokenize the utterance
      var punctuationToRemove = /[#?!.,|\/\(\)\*\#0-9]/g;
      var words = utterance.replace(punctuationToRemove, " ").split(/[ ]+/);
      for (var word = 0; word < words.length; word++) {
        // If the token it not null or the empty string
        if (!words[word]) {
          return;
        }

        var suffixOrder = reverseUnicodeString(words[word]);

        emit(suffixOrder);

        // emit({
        //   word: words[word],
        //   sortThisColumnToFindSuffixes: suffixOrder
        // }, {
        //   rhymingOrderToFindSuffixes: suffixOrder,
        //   grammaticalContexts: utterance
        // });
      }
    } catch (e) {
      emit(e, 1);
    }
  }
