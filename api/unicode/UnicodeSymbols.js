var Collection = require("./../Collection").Collection;
var UnicodeSymbol = require("./UnicodeSymbol").UnicodeSymbol;

/**
 * @class  UnicodeSymbols is a set of unicode symbols.
 *
 * @name  UnicodeSymbols
 *
 * @extends Collection
 * @constructs
 */
var UnicodeSymbols = function UnicodeSymbols(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "UnicodeSymbols";
  }
  this.debug("Constructing UnicodeSymbols length: ", options);
  Collection.apply(this, arguments);
};

UnicodeSymbols.prototype = Object.create(Collection.prototype, /** @lends UnicodeSymbols.prototype */ {
  constructor: {
    value: UnicodeSymbols
  },

  primaryKey: {
    value: "symbol"
  },

  INTERNAL_MODELS: {
    value: {
      item: UnicodeSymbol
    }
  },

  fill: {
    value: function() {

      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɐ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɑ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɒ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɓ"}));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "ɔ"
      }));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɕ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɖ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɗ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɘ"}));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "ə"
      }));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɚ"}));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "ɛ"
      }));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɜ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɝ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɞ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɟ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɠ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɡ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɢ"}));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "ɣ"
      }));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɤ"}));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "ɥ"
      }));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "ɦ"
      }));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɧ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɨ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɩ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɪ"}));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "ɫ"
      }));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɬ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɮ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɭ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɯ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɰ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɱ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɲ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɳ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɴ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɵ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɶ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɷ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɸ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɹ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɺ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɻ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɼ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɽ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɾ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ɿ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʀ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʁ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʂ"}));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "ʃ"
      }));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʄ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʅ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʆ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʇ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʈ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʉ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʊ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʋ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʌ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʍ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʎ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʏ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʐ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʑ"}));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "ʒ"
      }));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʓ"}));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "ʔ"
      }));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʕ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʖ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʗ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʘ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʙ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʚ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʛ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʜ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʝ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʞ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʟ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʠ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʡ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʢ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʣ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʤ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʥ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʦ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʧ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʨ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʩ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʪ"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ʫ"}));
      this.add(new UnicodeSymbol({
        tipa: "\\lambda",
        symbol: "λ "
      }));
      this.add(new UnicodeSymbol({
        tipa: "\\alpha",
        symbol: "α "
      }));
      this.add(new UnicodeSymbol({
        tipa: "\\beta",
        symbol: "β "
      }));
      this.add(new UnicodeSymbol({
        tipa: "\\forall",
        symbol: "∀"
      }));
      this.add(new UnicodeSymbol({
        tipa: "\\exists",
        symbol: "∃"
      }));
      this.add(new UnicodeSymbol({
        tipa: "^{\\circ}",
        symbol: "°"
      }));



      //
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "γ "}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "δ "}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ε "}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ζ "}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "η "}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "θ "}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "ι "}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "κ "}));



      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "∄"
      }));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "∅"
      }));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "∆"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "∇"}));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "∈"
      }));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "∉"
      }));

      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "∋"
      }));
      this.add(new UnicodeSymbol({
        tipa: "",
        symbol: "∌"
      }));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "∍"}));

      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≁"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≂"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≃"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≄"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≅"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≆"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≇"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≈"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≉"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≊"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≋"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≌"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≍"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≎"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≏"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≐"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≑"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≒"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≓"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≔"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≕"}));

      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≤"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≥"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≦"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≧"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≨"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≩"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≪"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≫"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≬"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≭"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≮"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≯"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≰"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≱"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≲"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≳"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "≴"}));

      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊂"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊃"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊄"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊅"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊆"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊇"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊈"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊉"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊊"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊋"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊌"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊍"}));
      //        this.add(new UnicodeSymbol({tipa: "", symbol:  "⊎"}));
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
      if (typeof value.replace !== "function") {
        value = value + "";
      }
      value = value.replace(/[-""+=?./\[\]{}() ]/g, "");
      return value;
    }
  }

});
exports.UnicodeSymbols = UnicodeSymbols;
