define([
    "backbone",
], function(Backbone) {
var UpdatingCollectionView = Backbone.View.extend({
    initialize : function(options) {
      _(this).bindAll('add', 'remove');

      if (!options.childViewConstructor)
        throw "no child view constructor provided";
      if (!options.childViewTagName)
        throw "no child view tag name provided";

      this._childViewConstructor = options.childViewConstructor;
      this._childViewTagName = options.childViewTagName;
      this._childViewFormat = options.childViewFormat || null;
      this._childViewClass = options.childViewClass || "";

      this._childViews = [];

      if(this.collection && this.collection.each){
        this.collection.each(this.add);
        this.collection.bind('add', this.add);
        this.collection.bind('remove', this.remove);
      }else{
        if (OPrime.debugMode) OPrime.debug("The collection was not a backbone collection...");
      }

    },

    tagName: "ul",

    add : function(model, collection, options) {
      var childView = new this._childViewConstructor({
        tagName : this._childViewTagName,
        className : this._childViewClass,
        model : model
      });

      if (this._childViewFormat) {
        childView.format = this._childViewFormat;
      }

      if(options == undefined || options == null){
        options = {};
        options.index = 1;
      }
      // Add to the top of the list
      if (options.index == 0 || options.at == 0) {
        this._childViews.unshift(childView);

        if (this._rendered) {
          $(this.el).prepend(childView.render().el);
        }
      // Add to the bottom of the list
      } else {
        this._childViews.push(childView);

        if (this._rendered) {
          $(this.el).append(childView.render().el);
        }
      }
    },

    remove : function(model) {
      var viewToRemove = _(this._childViews).select(function(cv) {
        return cv.model === model;
      })[0];
      this._childViews = _(this._childViews).without(viewToRemove);

      if (this._rendered)
        $(viewToRemove.el).remove();
    },

    render : function() {
      var that = this;
      this._rendered = true;

      $(this.el).empty();

      _(this._childViews).each(function(childView) {
        $(that.el).append(childView.render().el);
        childView.delegateEvents();
      });

      return this;
    }
  });
  return UpdatingCollectionView;
});
