/* globals window, $, _ , OPrime*/
"use strict";

var Datum = require("./Datum").Datum;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

var DEFAULT_CORPUS_MODEL = require("./../corpus/corpus.json");


/**
 * @class The LanguageDatum widget is the place where all linguistic data is
 *        entered; one at a time.
 *
 * @property {DatumField} transcription The transcription field generally
 *           corresponds to the first line in linguistic examples that can
 *           either be written in the language's orthography or a
 *           romanization of the language. An additional field can be added
 *           if the language has a non-roman script. (This was previously called the utterance field).
 * @property {DatumField} gloss The gloss field corresponds to the gloss
 *           line in linguistic examples where the morphological details of
 *           the words are displayed.
 * @property {DatumField} translation The translation field corresponds to
 *           the third line in linguistic examples where in general an
 *           English translation. An additional field can be added if
 *           translations into other languages is needed.
 * @property {DatumField} judgement The judgement is the grammaticality
 *           judgement associated with the datum, so grammatical,
 *           ungrammatical, felicitous, unfelicitous etc.
 * @property {AudioVisual} audioVideo LanguageDatums can be associated with an audio or video
 *           file.
 * @property {Session} session The session provides details about the set of
 *           data elicited. The session will contain details such as date,
 *           language, consultant etc.
 * @property {Comments} comments The comments is a collection of comments
 *           associated with the datum, this is meant for comments like on a
 *           blog, not necessarily notes, which can be encoded in a
 *           field.(Use Case: team discussing a particular datum)
 * @property {DatumTags} datumtags The datum tags are a collection of tags
 *           associated with the datum. These are made completely by the
 *           user.They are like blog tags, a way for the user to make
 *           categories without make a hierarchical structure, and make
 *           datum easier for search.
 * @property {Date} dateEntered The date the LanguageDatum was first saved.
 * @property {Date} dateModified The date the LanguageDatum was last saved.
 *
 * @description The initialize function brings up the datum widget in small
 *              view with one set of datum fields. However, the datum widget
 *              can contain more than datum field set and can also be viewed
 *              in full screen mode.
 *
 * @name  LanguageDatum
 * @extends Datum
 * @constructs
 */
var LanguageDatum = function LanguageDatum(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "LanguageDatum";
  }
  if (options && typeof options === "string") {
    this.debug("Turning LanguageDatum " + options + " to an object");
    options = {
      orthography: options
    };
  }
  this.debug("Constructing LanguageDatum: ", options);
  Datum.apply(this, [options]);
};

LanguageDatum.prototype = Object.create(Datum.prototype, /** @lends LanguageDatum.prototype */ {
  constructor: {
    value: LanguageDatum
  },

  orthography: {
    configurable: true,
    get: function() {
      if (this.fields && this.fields.orthography) {
        this.debug(" getting orthography " + this._id + " to " + this.fields.orthography.value);
        return this.fields.orthography.value;
      } else {
        return FieldDBObject.DEFAULT_STRING;
      }
    },
    set: function(value) {
      if (!this.fields || !this.fields.orthography) {
        this.addField("orthography");
      }
      this.debug("    Setting orthography " + this._id + " to " + value);
      this.fields.orthography.value = value;
    }
  },

  utterance: {
    configurable: true,
    get: function() {
      if (this.fields && this.fields.utterance) {
        return this.fields.utterance.value;
      } else {
        return FieldDBObject.DEFAULT_STRING;
      }
    },
    set: function(value) {
      if (!this.fields || !this.fields.utterance) {
        this.addField("utterance");
      }
      this.fields.utterance.value = value;
    }
  },

  /**
   * Morphemes of the datum, if morphemes is empty it will provide the utterance
   * or the orthography as a last resort copy
   * 
   * @return {[type]} [description]
   */
  morphemes: {
    configurable: true,
    get: function() {
      if (this.fields && this.fields.morphemes) {
        if (this.fields.morphemes.value) {
          return this.fields.morphemes.value;
        }
        var placeholder = this.utterance || this.orthography || FieldDBObject.DEFAULT_STRING;
        this.debug("morphemes is not defined so using " + placeholder);
        return placeholder + "";
      } else {
        return FieldDBObject.DEFAULT_STRING;
      }
    },
    set: function(value) {
      if (!this.fields || !this.fields.morphemes) {
        this.addField("morphemes");
      }
      this.fields.morphemes.value = value;
    }
  },

  allomorphs: {
    configurable: true,
    get: function() {
      if (this.fields && this.fields.allomorphs) {
        return this.fields.allomorphs.value;
      } else {
        return FieldDBObject.DEFAULT_STRING;
      }
    },
    set: function(value) {
      if (!this.fields || !this.fields.allomorphs) {
        this.addField("allomorphs");
      }
      this.fields.allomorphs.value = value;
    }
  },

  gloss: {
    configurable: true,
    get: function() {
      if (this.fields && this.fields.gloss) {
        return this.fields.gloss.value;
      } else {
        return FieldDBObject.DEFAULT_STRING;
      }
    },
    set: function(value) {
      if (!this.fields || !this.fields.gloss) {
        this.addField("gloss");
      }
      this.fields.gloss.value = value;
    }
  },

  syntacticCategory: {
    configurable: true,
    get: function() {
      if (this.fields && this.fields.syntacticCategory) {
        return this.fields.syntacticCategory.value;
      } else {
        return FieldDBObject.DEFAULT_STRING;
      }
    },
    set: function(value) {
      if (!this.fields || !this.fields.syntacticCategory) {
        this.addField("syntacticCategory");
      }
      this.fields.syntacticCategory.value = value;
    }
  },

  translation: {
    configurable: true,
    get: function() {
      if (this.fields && this.fields.translation) {
        return this.fields.translation.value;
      } else {
        return FieldDBObject.DEFAULT_STRING;
      }
    },
    set: function(value) {
      if (!this.fields || !this.fields.translation) {
        this.addField("translation");
      }
      this.fields.translation.value = value;
    }
  },

  igt: {
    get: function() {
      var igtLines = {},
        parallelText = {},
        tuples = [],
        feederWord,
        fullWord,
        lengthOfLongestIGTLineInWords,
        igtLine,
        cellIndex,
        tuple;

      var punctuationToRemove = /[#?!,\/\(\)\*\#]/g;
      var whiteSpaceSplit = /[ \t\n]+/;
      // var leipzigSplit = /[=-]+/;
      var cleanUngrammaticalitySubstitutions = false;

      this.fields.map(function(field) {
        if (field.type && field.type.indexOf("parallelText") > -1) {
          parallelText[field.id] = field.value;
        }
        if (!field.type || field.type.indexOf("IGT") === -1) {
          return;
        }

        var chunks = field.value.replace(/#?!.,\//g, "").split(whiteSpaceSplit);

        chunks = chunks.map(function(chunk) {
          if (cleanUngrammaticalitySubstitutions) {
            // If the token it not null or the empty string
            if (chunk) {
              // Replace (*_) with _
              feederWord = chunk.replace(/\(\*[^)]*\)/g, "$1");
              // Replace *(_) with _
              feederWord = feederWord.replace(/\*\(([^)]*)\)/, "$1");
              // Remove all remaining punctuation
              fullWord = feederWord.replace(punctuationToRemove, "");
              chunk = fullWord;
            }
          }

          // return chunk.split(leipzigSplit);
          return chunk;
        });

        igtLines[field.id] = chunks;
      });
      this.debug("Collected all the IGT lines", igtLines);
      this.debug("Collected all the Paralel Text lines", parallelText);

      // Build triples
      lengthOfLongestIGTLineInWords = 0;
      for (igtLine in igtLines) {
        if (igtLines[igtLine] && igtLines[igtLine].length > lengthOfLongestIGTLineInWords) {
          lengthOfLongestIGTLineInWords = igtLines[igtLine].length;
        }
      }

      // for each word
      for (cellIndex = 0; cellIndex < lengthOfLongestIGTLineInWords; cellIndex++) {
        tuple = {};
        // for each row of the igt
        for (igtLine in igtLines) {
          this.debug("working on   " + igtLine, igtLines[igtLine]);
          if (igtLines[igtLine] && igtLines[igtLine].length > cellIndex && igtLines[igtLine][cellIndex]) {
            tuple[igtLine] = igtLines[igtLine][cellIndex];
          } else {
            tuple[igtLine] = "";
          }
        }
        tuples.push(tuple);
      }

      this.debug("IGT+ tuples", tuples);


      return {
        tuples: tuples,
        parallelText: parallelText
      };

    },
    set: function() {
      this.warn("Setting the igt has to be copy pasted from one of the other codebases");
    }
  },

  /**
   * The LaTeXiT function automatically mark-ups an example in LaTeX code
   * (\exg. \"a) and then copies it on the export modal so that when the user
   * switches over to their LaTeX file they only need to paste it in.
   *
   * We did a poll on Facebook among EGGers, and other linguists we know and
   * found that Linguex was very popular, and GB4E, so we did the export in
   * GB4E.
   */
  /* jshint ignore:start */

  laTeXiT: {
    value: function(showInExportModal) {
      this.debug(showInExportModal);
      //corpus's most frequent fields
      var frequentFields;
      if (this.application && this.application.corpus && this.application.corpus.frequentFields) {
        frequentFields = this.application.corpus.frequentFields;
      } else {
        frequentFields = this.fields.map(function(field) {
          return field.id
        });
      }
      //this datum/datalist's datumfields and their names
      var fields = this.fields.map(function(field) {
        return field.value;
      });
      var fieldLabels = this.fields.map(function(field) {
        return field.id;
      });
      //setting up for IGT case...
      var judgementIndex = -1;
      var judgement = "";
      var utteranceIndex = -1;
      var utterance = "";
      var morphemesIndex = -1;
      var morphemes = "";
      var glossIndex = -1;
      var gloss = "";
      var translationIndex = -1;
      var translation = "";
      var result = "\n\\begin{exe} \n  \\ex \[";

      //IGT case:
      if (this.datumIsInterlinearGlossText()) {
        /* get the key pieces of the IGT and delete them from the fields and fieldLabels arrays*/
        judgementIndex = fieldLabels.indexOf("judgement");
        if (judgementIndex >= 0) {
          judgement = fields[judgementIndex];
          fieldLabels.splice(judgementIndex, 1);
          fields.splice(judgementIndex, 1);
        }
        utteranceIndex = fieldLabels.indexOf("utterance");
        if (utteranceIndex >= 0) {
          utterance = fields[utteranceIndex];
          fieldLabels.splice(utteranceIndex, 1);
          fields.splice(utteranceIndex, 1);
        }
        morphemesIndex = fieldLabels.indexOf("morphemes");
        if (morphemesIndex >= 0) {
          morphemes = fields[morphemesIndex];
          fieldLabels.splice(morphemesIndex, 1);
          fields.splice(morphemesIndex, 1);
        }
        glossIndex = fieldLabels.indexOf("gloss");
        if (glossIndex >= 0) {
          gloss = fields[glossIndex];
          fieldLabels.splice(glossIndex, 1);
          fields.splice(glossIndex, 1);
        }
        translationIndex = fieldLabels.indexOf("translation");
        if (translationIndex >= 0) {
          translation = fields[translationIndex];
          fieldLabels.splice(translationIndex, 1);
          fields.splice(translationIndex, 1);
        }
        //print the main IGT, escaping special latex chars
        /* ignore unnecessary escapement */
        result = result + this.escapeLatexChars(judgement) + "\]\{" + this.escapeLatexChars(utterance) +
          "\n  \\gll " + this.escapeLatexChars(morphemes) + "\\\\" +
          "\n  " + this.escapeLatexChars(gloss) + "\\\\" +
          "\n  \\trans " + this.escapeLatexChars(translation) + "\}" +
          "\n\\label\{\}";
      }
      //remove any empty fields from our arrays
      for (var i = fields.length - 1; i >= 0; i--) {
        if (!fields[i]) {
          fields.splice(i, 1);
          fieldLabels.splice(i, 1);
        }

      }
      /*throughout this next section, print frequent fields and infrequent ones differently
      frequent fields get latex'd as items in a description and infrequent ones are the same,
      but commented out.*/
      if (fields && (fields.length > 0)) {
        var numInfrequent = 0;
        for (var field in fields) {
          if (frequentFields.indexOf(fieldLabels[field]) >= 0) {
            break;
          }
          numInfrequent++;
        }
        if (numInfrequent !== fieldLabels.length) {
          result = result + "\n  \\begin\{description\}";
        } else {
          result = result + "\n%  \\begin\{description\}";
        }
        for (field in fields) {
          if (fields[field] && (frequentFields.indexOf(fieldLabels[field]) >= 0)) {
            result = result + "\n    \\item\[\\sc\{" + this.escapeLatexChars(fieldLabels[field]) + "\}\] " + this.escapeLatexChars(fields[field]);
          } else if (fields[field]) {
            /* If as a field that is designed for LaTex dont excape the LaTeX characters */
            if (fieldLabels[field].toLowerCase().indexOf("latex") > -1) {
              result = result + "\n " + fields[field];
            } else {
              result = result + "\n%    \\item\[\\sc\{" + this.escapeLatexChars(fieldLabels[field]) + "\}\] " + this.escapeLatexChars(fields[field]);
            }
          }
        }
        if (numInfrequent !== fieldLabels.length) {
          result = result + "\n  \\end\{description\}";
        } else {
          result = result + "\n%  \\end\{description\}";
        }

      }
      result = result + "\n\\end{exe}\n\n";

      return result;
    }
  },

  datumIsInterlinearGlossText: {
    value: function(fieldLabels) {
      if (!fieldLabels) {
        fieldLabels = this.fields.map(function(field) {
          return field.id;
        });
      }

      var utteranceOrMorphemes = false;
      var gloss = false;
      var trans = false;
      for (var fieldLabel in fieldLabels) {
        if (fieldLabels[fieldLabel] === "utterance" || fieldLabels[fieldLabel] === "morphemes") {
          utteranceOrMorphemes = true;
        }
        if (fieldLabels[fieldLabel] === "gloss") {
          gloss = true;
        }
        if (fieldLabels[fieldLabel] === "translation") {
          trans = true;
        }
      }
      if (gloss || utteranceOrMorphemes || trans) {
        return true;
      } else {
        return false;
      }
    }
  }

});
exports.LanguageDatum = LanguageDatum;
