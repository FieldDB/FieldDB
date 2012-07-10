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
      if(typeof(this.get("unicodes")) == "function"){
        this.set("unicodes", new InsertUnicodes([ 
          new InsertUnicode({symbol: "ɑ"}),
         new InsertUnicode({symbol: "ɒ"})
        ]));
      }//end if to set unicode
      
    },
    
    defaults : {
      skin : "",
      numVisibleDatum : 3,
      unicodes : InsertUnicodes
    },
    
    // Internal models: used by the parse function
    model : {
      unicodes : InsertUnicodes

    },
    
    
  });

  return UserPreference;
});
