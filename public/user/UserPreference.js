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
        
        
        
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɐ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɑ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɒ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɓ"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɔ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɕ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɖ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɗ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɘ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ə"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɚ"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɛ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɜ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɝ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɞ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɟ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɠ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɡ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɢ"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɣ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɤ"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɥ"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɦ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɧ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɨ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɩ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɪ"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɫ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɬ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɮ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɭ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɯ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɰ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɱ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɲ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɳ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɴ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɵ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɶ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɷ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɸ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɹ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɺ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɻ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɼ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɽ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɾ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ɿ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʀ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʁ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʂ"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʃ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʄ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʅ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʆ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʇ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʈ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʉ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʊ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʋ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʌ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʍ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʎ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʏ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʐ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʑ"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʒ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʓ"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʔ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʕ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʖ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʗ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʘ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʙ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʚ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʛ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʜ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʝ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʞ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʟ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʠ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʡ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʢ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʣ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʤ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʥ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʦ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʧ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʨ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʩ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʪ"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ʫ"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "\lambda", symbol:  "λ "}));
        this.get("unicodes").add(new InsertUnicode({tipa: "\alpha", symbol:  "α "}));
        this.get("unicodes").add(new InsertUnicode({tipa: "\beta", symbol:  "β "}));
        this.get("unicodes").add(new InsertUnicode({tipa: "\forall", symbol:  "∀"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "\exists", symbol:  "∃"}));

        
       
//
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "γ "}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "δ "}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ε "}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ζ "}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "η "}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "θ "}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "ι "}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "κ "}));
        
        
        
      
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "∄"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "∅"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "∆"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "∇"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "∈"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "∉"}));
    
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "∋"}));
        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "∌"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "∍"}));
       
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≁"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≂"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≃"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≄"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≅"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≆"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≇"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≈"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≉"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≊"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≋"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≌"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≍"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≎"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≏"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≐"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≑"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≒"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≓"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≔"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≕"}));
     
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≤"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≥"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≦"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≧"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≨"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≩"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≪"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≫"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≬"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≭"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≮"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≯"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≰"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≱"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≲"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≳"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "≴"}));
      
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊂"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊃"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊄"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊅"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊆"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊇"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊈"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊉"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊊"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊋"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊌"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊍"}));
//        this.get("unicodes").add(new InsertUnicode({tipa: "", symbol:  "⊎"}));
      }
      
    },
    
    defaults : {
      skin : "",
      numVisibleDatum : 3,
      transparentDashboard: false,
      alwaysRandomizeSkin : true
    },
    
    // Internal models: used by the parse function
    model : {
      unicodes : InsertUnicodes
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
    
  });

  return UserPreference;
});
