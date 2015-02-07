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
    if (datum.judgement && datum.judgement.indexOf("*") >= 0) {
      return;
    }
    if (datum.utterance && datum.utterance.indexOf("*") >= 0) {
      return;
    }
    var words = datum.utterance.toLowerCase().replace(/#?!.,\//g, "").split(/[ ]+/);
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

    // Build IGT groups per word in the utterance
    var igtWords = [];
    for (var j in context.words) {
      var w = context.words[j];
      var morphItems = context.morphemes[j].split("-");
      var glossItem = context.glosses[j].split("-");
      var currentWord = {
        "text": w,
        "morphemes": []
      };
      for (var i in morphItems) {
        currentWord.morphemes.push({
          "morpheme": [{
            "text": {
              "_xsi:type": "morpheme",
              "value": morphItems[i]
            }
          }, {
            "text": {
              "_xsi:type": "gloss",
              "value": i < glossItem.length ? glossItem[i] : "???"
            }
          }]
        });
      }
      igtWords.push(currentWord);
    }

    var eopasPhrase = {
      "phrase": {
        "_id": doc._id,
        "_startTime": "0.000",
        "_endTime": "0.000",
        "text": [{
          "_xsi:type": "orthographic",
          "text": datum.utterance
        }, {
          "_xsi:type": "translation",
          "text": datum.translation
        }],
        "words": igtWords
      }
    };
    emit(eopasPhrase, 1);

    // <phrases>
    //   <phrase id="s1" startTime="10.963" endTime=" 16.802">
    //     <text xsi:type="translation">I wanna steal Josefina(?)
    //     </text>
    //     <text xsi:type="orthographic">Suwanayki Josefina
    //     </text>
    //     <words>
    //       <word>
    //         <text xsi:type="orthographic">Suwanayki
    //         </text>
    //         <morphemes>
    //           <morpheme>
    //             <text xsi:type="morpheme">Suwa
    //             </text>
    //             <text xsi:type="gloss">steal
    //             </text>
    //           </morpheme>
    //           <morpheme>
    //             <text xsi:type="morpheme">-nay
    //             </text>
    //             <text xsi:type="gloss">want
    //             </text>
    //           </morpheme>
    //           <morpheme>
    //             <text xsi:type="morpheme">-ki
    //             </text>
    //             <text xsi:type="gloss">-1-2
    //             </text>
    //           </morpheme>
    //         </morphemes>
    //       </word>
    //       <word>
    //         <text xsi:type="orthographic">Josefina
    //         </text>
    //         <morphemes>
    //           <morpheme>
    //             <text xsi:type="morpheme">Josefina
    //             </text>
    //             <text xsi:type="gloss">Josefina
    //             </text>
    //           </morpheme>
    //         </morphemes>
    //       </word>
    //     </words>
    //   </phrase>
    // </phrases>

  } catch (e) {
    //emit(e, 1);
  }
}
