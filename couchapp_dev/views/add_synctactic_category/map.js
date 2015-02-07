/*
 * This map function goes through the utterance, morphemes and gloss line to
 * find the glosses for each morpheme, and guess the syntactic category for the
 * mopheme. Why would we do this? We realized that when we want to clean,
 * sometimes we want to refer to only nouns and verbs etc, and we can only do
 * that if we have it indicated somewhere. So we were thinking about adding
 * another default line to datum which is the morphosyntactic category of the
 * morpheme (you could use the Penn Treebank tag
 * set(http://www.ims.uni-stuttgart.de/projekte/CorpusWorkbench/CQP-HTMLDemo/PennTreebankTS.html)
 * which is what everyone in computational linguistics uses (mostly because its
 * simple enough a human can tag words using it, and its general enough that you
 * dont get too much fragmentation), or you could use what you would use for a
 * Distributed Morphology tree...
 */
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
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }

    /*
     * If its not a datum (ie if its not the case that it has datumFields AND
     * session)
     */
    if (!(doc.datumFields && doc.session)) {
      /* ignore this document */
      return;
    }

    var datum = convertDatumIntoSimpleObject(doc);
    if (!datum) {
      return;
    }

    /* Now find all the words in the utterance */
    var words = datum.utterance.toLowerCase().replace(/#?!.,\//g, "").split(
      /[ ]+/);
    for (var word = 0; word < words.length; words++) {
      // If the token it not null or the empty string
      if (words[word]) {
        // Replace (*_) with ""
        var feederWord = words[word].replace(/\(\*[^)]*\)/g, "");
        // Replace *(_) with _
        feederWord = feederWord.replace(/\*\(([^)]*)\)/, '$1');
        // Remove all parentheses and *
        var fullWord = feederWord.replace(/[(*)]/g, "");
        words[word] = fullWord;
      }
    }
    datum.individualwords = words;

    /* Now find all the individual morphemes in the morphemes line */
    var morphemes = datum.morphemes.replace(/#!,\//g, "").split(/[ ]+/);
    for (var morphemegroup = 0; morphemegroup < morphemes.length; morphemegroup++) {
      // If the token it not null or the empty string
      if (morphemes[morphemegroup]) {
        /*
         * Replace (*_) with "" but DONT replace ? it is used to indicate
         * uncertainty with the data, . is used for fusional morphemes Replace
         * *(_) with _
         */
        var feederWord = morphemes[morphemegroup].replace(/\(\*[^)]*\)/g, "");
        feederWord = feederWord.replace(/\*\(([^)]*)\)/, "$1");
        // Remove all parentheses and *
        var fullWord = feederWord.replace(/[(*)]/g, "");
        morphemes[morphemegroup] = fullWord;
      }
    }
    datum.individualmorphemes = morphemes;

    /* Now find all the glosses in the glosses line */
    var glosses = datum.gloss.replace(/#!,\//g, "").split(/[ ]+/);
    for (var glossgroup = 0; glossgroup < glosses.length; glossgroup++) {
      // If the token it not null or the empty string
      if (glosses[glossgroup]) {
        // Replace (*_) with ""
        var feederWord = glosses[glossgroup].replace(/\(\*[^)]*\)/g, "");
        // Replace *(_) with _
        feederWord = feederWord.replace(/\*\(([^)]*)\)/, "$1");
        // Remove all parentheses and *
        var fullWord = feederWord.replace(/[(*)]/g, "");
        glosses[glossgroup] = fullWord;
      }
    }
    datum.individualglosses = glosses;

    /*
     * Lets declare us a mini list of known migmaq strings that indicate the
     * grammtaical category of the morpheme.
     */
    var knownVerbs = "apoqonm,gaqami,atal,lugwe,mijji,nemi".split(",");
    var knownNouns = "e'pit,awti,goqoligwej,ji'nm".split(",");
    var knownAspect = "etl".split(",");
    var knownWH = "goqwei".split(",");

    /*
     * Now lets use these 3 lines to build tuples, ie blocks of morphems and
     * glosses
     */
    for (var word = 0; word < datum.individualwords.length; word++) {
      /* get the word, morphemes, gloss set for this word */
      var aword = datum.individualwords[word];
      var awordofmorphemes = datum.individualmorphemes[word].split("-");
      var awordofglosss = datum.individualglosses[word].split("-");
      /*
       * Now loop through the pieces in the morphemes to find each morphemes
       * corresponding gloss, and guess its syntactic category.
       */
      for (var morph = 0; morph < awordofmorphemes.length; morph++) {
        /* lets make a variable to refer to this morpheme of this word */
        var thismorpheme = awordofmorphemes[morph];
        /*
         * lets make a variable to refer to this gloss of this word, bassically
         * the gloss of the above morpheme
         */
        var thisgloss = awordofglosss[morph] || "";
        /*
         * lets start by saying that morhemes' syntactic category by default can
         * just be the morpheme itself.
         */
        var syntacticCategory = thismorpheme;

        /*
         * if the gloss has a number, its probably a little v becaues its marked
         * for number agreement
         */
        if (thisgloss.search("[0-9]") > -1) {
          syntacticCategory = "v°";
        }
        /*
         * if this morpheme is in our list of known Verb roots, its probably a
         * verb (we decided to call it V° but you could call it "Verb" or anything
         * you want.
         */
        if (knownVerbs.indexOf(thismorpheme) > -1) {
          syntacticCategory = "V°";
        }

        /*
         * if this morpheme is in our list of known noun roots, its probably a
         * noun.
         */
        if (knownNouns.indexOf(thismorpheme) > -1) {
          syntacticCategory = "N°";
        }

        /*
         * if this morpheme is in our list of known aspect, its probobaly an
         * aspect head
         */
        if (knownAspect.indexOf(thismorpheme) > -1) {
          syntacticCategory = "Aspect";
        }
        if (knownWH.indexOf(thismorpheme) > -1) {
          syntacticCategory = "WH";
        }
        emit({
          morpheme: thismorpheme,
          gloss: thisgloss || "??",
          syntacticCategory: syntacticCategory
        }, datum);
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
