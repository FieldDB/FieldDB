define([ "use!backbone", "use!handlebars", "search/Search",
    "text!search/search.handlebars" ], function(Backbone, Handlebars, Search,
    searchTemplate) {
  var SearchView = Backbone.View.extend(
  /** @lends DatumFieldView.prototype */
  {
    /**
     * @class Search View handles the render of the global search in the corner,
     *        and the advanced power search, as well as their events.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      this.on('all', function(e) {
        this.render();
      });
      this.model.bind('change', this.render);
      this.render();
    },
    events : {
      "change" : "render",
      "all" : "render"
//      "blur" : this.model.saveKeyword
    },
    model : Search,
    classname : "search",
    template : Handlebars.compile(searchTemplate),
    el : '#search',
    render : function() {
      if(this.model != undefined){
        $(this.el).html(this.template(this.model.toJSON()));
        console.log("\trendering search: "+ this.model.get("searchKeywords"));
      }else{
        console.log("\tSearch model was undefined");
      }
      return this;
    },
    loadSample : function(){
      this.model.set("searchKeywords","naya");
      console.log("Changing search keyword: "+ this.model.get("searchKeywords"));
    }
  });

  return SearchView;
});