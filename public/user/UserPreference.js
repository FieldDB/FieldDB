define([
    "backbone",
    "insert_unicode/InsertUnicode",
    "insert_unicode/InsertUnicodes"
], function(
    Backbone,
    InsertUnicode,
    InsertUnicodes
) {
  var UserPreference = Backbone.Model.extend(
  /** @lends UserPreference.prototype */
  {
    /**
     * @class Hold preferences for users like the skin of the app
     * 
     * @property {int} skin This is user's preferred skin.
     * @property {int} numVisibleDatum The number of Datum visible at the time on
     * the Datum*View's.
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      if(this.get("unicodes") == undefined){
        this.set("unicodes", new InsertUnicodes());
      }//end if to set unicode
      if(this.get("unicodes").models.length == 0){
        
        
        
        this.get("unicodes").add(new InsertUnicode({symbol: "ɐ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɑ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɒ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɓ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɔ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɕ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɖ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɗ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɘ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ə"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɚ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɛ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɜ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɝ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɞ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɟ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɠ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɡ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɢ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɣ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɤ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɥ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɦ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɧ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɨ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɩ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɪ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɫ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɬ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɭɮ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɯ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɰ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɱ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɲ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɳ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɴ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɵ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɶ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɷ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɸ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɹ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɺ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɻ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɼ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɽ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɾ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ɿ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʀ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʁ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʂ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʃ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʄ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʅ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʆ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʇ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʈ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʉ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʊ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʋ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʌ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʍ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʎ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʏ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʐ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʑ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʒ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʓ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʔ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʕ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʖ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʗ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʘ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʙ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʚ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʛ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʜ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʝ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʞ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʟ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʠ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʡ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʢ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʣ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʤ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʥ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʦ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʧ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʨ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʩ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʪ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʫ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʬ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʭ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʮ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʯ"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "0"}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ͱ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ͳ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ͳ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ʹ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "͵ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ͷ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ͷ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: " "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ͺ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ͻ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ͼ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ͽ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "; "}));
        this.get("unicodes").add(new InsertUnicode({symbol: " "}));
        this.get("unicodes").add(new InsertUnicode({symbol: " "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "΄ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "΅ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ά "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "· "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Έ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ή "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ί "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ό "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ύ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ώ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ΐ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Α "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Β "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Γ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Δ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ε "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ζ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Η "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Θ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ι "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Κ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Λ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Μ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ν "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ξ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ο "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Π "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ρ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "΢ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Σ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Τ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Υ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Φ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Χ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ψ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ω "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϊ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϋ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ά "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "έ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ή "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ί "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ΰ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "α "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "β "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "γ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "δ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ε "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ζ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "η "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "θ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ι "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "κ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "λ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "μ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ν "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ξ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ο "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "π "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ρ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ς "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "σ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "τ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "υ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "φ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "χ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ψ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ω "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϊ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϋ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ό "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ύ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ώ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϗ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϐ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϑ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϒ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϓ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϔ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϕ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϖ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϗ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϙ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϙ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϛ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϛ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϝ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϝ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϟ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϟ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϡ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϡ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϣ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϣ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϥ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϥ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϧ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϧ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϩ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϩ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϫ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϫ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϭ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϭ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϯ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϯ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϰ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϱ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϲ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϳ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϴ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϵ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "϶ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϸ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϸ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϲ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ϻ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϻ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "ϼ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ͻ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ͼ "}));
        this.get("unicodes").add(new InsertUnicode({symbol: "Ͽ "}));
      }
      
    },
    
    defaults : {
      skin : "",
      numVisibleDatum : 3,
    },
    
    // Internal models: used by the parse function
    model : {
      unicodes : InsertUnicodes
    },
    
    
  });

  return UserPreference;
});
