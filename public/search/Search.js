define([ 
    "backbone",
    "libs/Utils" 
], function(
    Backbone
) {
  var Search = Backbone.Model.extend(
  /** @lends Search.prototype  */
  {
    /** 
     * @class Search progressively searches a corpus and updates a 
     *        search/data list view as a user types keywords in the 
     *        search box. Both intersection and union search is 
     *        possible. It highlights search keywords in the list view.  
     * 
     * @property {String} searchKeywords 
     * @property {DataList} 
     * 
     * @description The initialize function probably creates a link to 
     *              a corpus, or checks if a link is established. 
     * 
     * @extends Backbone.Model
     * @constructs
     */

    initialize : function() {
      this.on('all', function(e) {
        Utils.debug(this.get('searchKeywords') + " event: " + JSON.stringify(e));
      });
    },
    
    defaults : {
      searchKeywords : ""
    },
    
    // Internal models: used by the parse function
    model : {
      // There are no nested models
    },
    
    saveKeyword: function(){
      this.set("searchKeywords","hihi");
    }
  });

  return Search;
});
