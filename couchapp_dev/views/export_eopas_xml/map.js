function(doc) {
  var utterance = "";
  var translation = "";

  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) return;
    // If the document is a Datum
    if (doc.audioVideo) {
      // Loop over all its DatumFields
      for (var key in doc.datumFields) {
        // If the DatumField contains the Judgement
        if (doc.datumFields[key].label == 'judgement') {
          // If the Judgement contains a '*', don't count the words in it
          if (doc.datumFields[key].mask && doc.datumFields[key].mask.indexOf('*') >= 0) {
            return;
          }
          break;
        }
      }
      var context = {};
      // Loop over all its DatumFields
      for (var key in doc.datumFields) {
        // If the DatumField contains the Utterance
        if (doc.datumFields[key].label == 'utterance') {
          // Trim whitespace
          utterance = doc.datumFields[key].mask ? doc.datumFields[key].mask.trim() : "";
          // If the utterance is ungrammatical, don't count the words in it
          if (utterance.indexOf('*') == 0) {
            return;
          }
          if (utterance == '') {
            return;
          }
          // Tokenize the utterance
          var words = utterance.toLowerCase().replace(/#?!.,\//g, '').split(
            /[ ]+/);
          for (var word in words) {
            // If the token it not null or the empty string
            if (words[word]) {
              // Replace (*_) with ''
              var feederWord = words[word].replace(/\(\*[^)]*\)/g, '');
              // Replace *(_) with _
              feederWord = feederWord.replace(/\*\(([^)]*)\)/, '$1');
              // Remove all parentheses and *
              var fullWord = feederWord.replace(/[(*)]/g, '');
              words[word] = fullWord;
            }
          }
          context.words = words;
        }
        if (doc.datumFields[key].label == 'morphemes') {
          // Trim whitespace
          var morphemesline = doc.datumFields[key].mask ? doc.datumFields[key].mask.trim() : "";
          // Tokenize the morphemes
          var morphemes = morphemesline.replace(/#!,\//g, '').split(/[ ]+/);
          for (var morphemegroup in morphemes) {
            // If the token it not null or the empty string
            if (morphemes[morphemegroup]) {
              // Replace (*_) with ''
              var feederWord = morphemes[morphemegroup].replace(/\(\*[^)]*\)/g,
                ''); // DONT
              // replace
              // ? it is
              // used to
              // indicate
              // uncertainty
              // with
              // the
              // data, .
              // is used
              // for
              // fusional
              // morphemes
              // Replace *(_) with _
              feederWord = feederWord.replace(/\*\(([^)]*)\)/, '$1');
              // Remove all parentheses and *
              var fullWord = feederWord.replace(/[(*)]/g, '');
              morphemes[morphemegroup] = fullWord;
            }
          }
          context.morphemes = morphemes;
        }
        if (doc.datumFields[key].label == 'gloss') {
          // Trim whitespace
          var gloss = doc.datumFields[key].mask ? doc.datumFields[key].mask.trim() : "";
          // Tokenize the gloss
          var glosses = gloss.replace(/#!,\//g, '').split(/[ ]+/); // DONT replace
          // ? it is
          // used to indicate
          // uncertainty with the
          // data, . is used for
          // fusional morphemes
          for (var glossgroup in glosses) {
            // If the token it not null or the empty string
            if (glosses[glossgroup]) {
              // Replace (*_) with ''
              var feederWord = glosses[glossgroup].replace(/\(\*[^)]*\)/g, '');
              // Replace *(_) with _
              feederWord = feederWord.replace(/\*\(([^)]*)\)/, '$1');
              // Remove all parentheses and *
              var fullWord = feederWord.replace(/[(*)]/g, '');
              glosses[glossgroup] = fullWord;
            }
          }
          context.glosses = glosses;
        }
        if (doc.datumFields[key].label == 'translation') {
          translation = doc.datumFields[key].mask ? doc.datumFields[key].mask.trim() : "";
        }
      }
      // Build IGT groups per word in the utterance
      var igtWords = [];
      for (var j in context.words) {
        var w = context.words[j];
        var morphItems = context.morphemes[j].split('-');
        var glossItem = context.glosses[j].split('-');
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
          "text": {
            "_xsi:type": "orthographic",
            "text": utterance
          },
          "text": {
            "_xsi:type": "translation",
            "text": translation
          },
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

    }
  } catch (e) {
    //emit(e, 1);
  }
}
