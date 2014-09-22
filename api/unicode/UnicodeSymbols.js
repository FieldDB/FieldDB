var Collection = require("./../Collection").Collection;
var InsertUnicode = require("./UnicodeSymbol").InsertUnicode;

/**
 * @class  InsertUnicodes is a set of unicode symbols.
 *
 * @name  InsertUnicodes
 *
 * @extends Collection
 * @constructs
 */
var InsertUnicodes = function InsertUnicodes(options) {
  this.debug("Constructing InsertUnicodes length: ", options);
  Collection.apply(this, arguments);
  this.alwaysConfirmOkay = true;
  this.todo("setting unicodes to auto confirm overwrite to avoid popups in the demo");
};

InsertUnicodes.prototype = Object.create(Collection.prototype, /** @lends InsertUnicodes.prototype */ {
  constructor: {
    value: InsertUnicodes
  },

  primaryKey: {
    value: "symbol"
  },

  INTERNAL_MODELS: {
    value: {
      item: InsertUnicode
    }
  },

  fill: {
    value: function() {

      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɐ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɑ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɒ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɓ"}));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "ɔ"
      }));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɕ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɖ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɗ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɘ"}));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "ə"
      }));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɚ"}));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "ɛ"
      }));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɜ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɝ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɞ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɟ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɠ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɡ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɢ"}));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "ɣ"
      }));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɤ"}));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "ɥ"
      }));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "ɦ"
      }));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɧ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɨ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɩ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɪ"}));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "ɫ"
      }));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɬ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɮ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɭ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɯ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɰ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɱ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɲ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɳ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɴ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɵ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɶ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɷ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɸ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɹ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɺ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɻ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɼ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɽ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɾ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ɿ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʀ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʁ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʂ"}));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "ʃ"
      }));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʄ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʅ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʆ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʇ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʈ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʉ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʊ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʋ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʌ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʍ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʎ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʏ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʐ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʑ"}));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "ʒ"
      }));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʓ"}));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "ʔ"
      }));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʕ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʖ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʗ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʘ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʙ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʚ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʛ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʜ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʝ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʞ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʟ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʠ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʡ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʢ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʣ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʤ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʥ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʦ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʧ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʨ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʩ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʪ"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ʫ"}));
      this.add(new InsertUnicode({
        tipa: "\\lambda",
        symbol: "λ "
      }));
      this.add(new InsertUnicode({
        tipa: "\\alpha",
        symbol: "α "
      }));
      this.add(new InsertUnicode({
        tipa: "\\beta",
        symbol: "β "
      }));
      this.add(new InsertUnicode({
        tipa: "\\forall",
        symbol: "∀"
      }));
      this.add(new InsertUnicode({
        tipa: "\\exists",
        symbol: "∃"
      }));
      this.add(new InsertUnicode({
        tipa: "^{\\circ}",
        symbol: "°"
      }));



      //
      //        this.add(new InsertUnicode({tipa: "", symbol:  "γ "}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "δ "}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ε "}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ζ "}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "η "}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "θ "}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "ι "}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "κ "}));



      this.add(new InsertUnicode({
        tipa: "",
        symbol: "∄"
      }));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "∅"
      }));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "∆"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "∇"}));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "∈"
      }));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "∉"
      }));

      this.add(new InsertUnicode({
        tipa: "",
        symbol: "∋"
      }));
      this.add(new InsertUnicode({
        tipa: "",
        symbol: "∌"
      }));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "∍"}));

      //        this.add(new InsertUnicode({tipa: "", symbol:  "≁"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≂"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≃"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≄"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≅"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≆"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≇"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≈"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≉"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≊"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≋"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≌"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≍"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≎"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≏"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≐"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≑"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≒"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≓"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≔"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≕"}));

      //        this.add(new InsertUnicode({tipa: "", symbol:  "≤"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≥"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≦"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≧"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≨"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≩"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≪"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≫"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≬"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≭"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≮"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≯"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≰"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≱"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≲"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≳"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "≴"}));

      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊂"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊃"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊄"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊅"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊆"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊇"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊈"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊉"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊊"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊋"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊌"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊍"}));
      //        this.add(new InsertUnicode({tipa: "", symbol:  "⊎"}));
    }
  },

  /**
   *  Cleans a value to become a primary key on an object (replaces punctuation with underscore)
   *  (replaces the default Collection.sanitizeStringForPrimaryKey method which scrubs unicode from the primary keys)
   *
   * @param  String value the potential primary key to be cleaned
   * @return String       the value cleaned and safe as a primary key
   */
  sanitizeStringForPrimaryKey: {
    value: function(value) {
      this.debug("sanitizeStringForPrimaryKey");
      if (!value) {
        return null;
      }
      if (value.trim) {
        value = value.trim().replace(/[-\""+=?.*&^%,\/\[\]{}() ]/g, "_").replace(/^_/, "").replace(/_$/, "");
        return this.camelCased(value);
      } else if (typeof value === "number") {
        return parseInt(value, 10);
      } else {
        return null;
      }
    }
  }

});
exports.InsertUnicodes = InsertUnicodes;
