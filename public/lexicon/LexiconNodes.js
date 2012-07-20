define("lexicon/LexiconNodes", 
    ["backbone",
     "lexicon/LexiconNode"],
    function(Backbone, LexiconNode) {
  
  var LexiconNodes = Backbone.Collection.extend(
      
    /** @lends LexiconNodes.prototype */ 
        
    {
      /**
       * @class Lexicon Nodes is a collection of lexicon nodes is key value pair with an index of related datum. 
       * 
       * @description
       * 
       * @extends Backbone.Model
       * 
       * @constructs
       * 
       */
    model : LexiconNode,
    defaultOptions : {unique: true},
    //https://github.com/documentcloud/backbone/pull/808
    add : function(model, options) {
//    	console.log("Overriding add");
        options || defaultOptions;
        model = this._prepareModel(model, options);
        if (!model) return false;
        if (options.unique) {
          var already = this.getByCid(model) || this.get(model.id);
          if (already) {
            console.log("This LexiconNode already existed", model);
//            throw new Error(["Can't add the same model to a set twice", already.id]);
          }
        }
        this._byId[model.id] = model;
        this._byCid[model.cid] = model;
        var index = options.at != null ? options.at :
                    this.comparator ? this.sortedIndex(model, this.comparator) :
                    this.length;
        this.models.splice(index, 0, model);
        model.bind('all', this._onModelEvent);
        this.length++;
        options.index = index;
        if (!options.silent) model.trigger('add', model, this, options);
        return model;
      }

   

  
  }); 
  
  return LexiconNodes; 
  
}); 
