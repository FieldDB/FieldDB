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
      internalModels : LexiconNode,
      model : LexiconNode,
    /*
     * if want to do versioning on nodes, or if we want to do something
     * special with all the similar nodes. most likely this will be
     * unnecesary since the data from the server is the most accurate? but
     * no, it is pure data, the user might have corrected it at some point.
     * we should store the corrections somewhere so they can be replayed on
     * the training data results. this might be an interesting measure of
     * accuracy/ usability if the number of correctiones reduces propoortial
     * to the nnumber of nodes.
     */
    //    defaultOptions : {unique: true, concatSimilarNodes: true},
    //if just want normal use of nodes, ie add duplicates if the user syncs or loads the lexicon again. this is a bad idea.
    //defaultOptions : {unique: false, concatSimilarNodes: false},
    //if want to take the most recent node only
    defaultOptions : {unique: true, concatSimilarNodes: false},

    //https://github.com/documentcloud/backbone/pull/808
    add : function(model, options) {
//    	console.log("Overriding add");
        options = options || this.defaultOptions;
        model = this._prepareModel(model, options);
        if (!model) return false;
        if (options.unique) {
          //If it is already known to pouch or backbone dont add it
//          var already = this.getByCid(model) || this.get(model.id);
          //If there is a node with the same morpheme, gloss, don't add it.
          var already = this.where({morpheme: model.get("morpheme"), gloss: model.get("gloss")});
          if (already.length > 0) {
//            console.log("This morpheme gloss pair already existed", already, model.toJSON());
            if(options.concatSimilarNodes){
              //Update the node's value (but put a copy of its local value in too)
              var similarNode = this.where({morpheme: model.get("morpheme"), gloss: model.get("gloss")})[0];
              model.set("valueLocalOld", similarNode.get("value"));
              //TODO do some correction logic here if the user has corrected this node?
            }
            //put the new models info into the existing member of the collection
            if (OPrime.debugMode) OPrime.debug("Updating ", already[0].toJSON(), " to ", model.toJSON());
            already[0].set(model.toJSON());
            return; //don't throw error, just happily return
//            throw new Error(["Can't add the same model to a set twice", already.id]);
          }
        }
        // this._byId[model.id] = model;
        // this._byCid[model.cid] = model;
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
