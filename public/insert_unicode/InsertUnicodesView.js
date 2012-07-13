define([
    "backbone", 
    "handlebars", 
    "insert_unicode/InsertUnicode",
    "insert_unicode/InsertUnicodeView",
    "app/UpdatingCollectionView",

], function(Backbone,
    Handlebars,
    InsertUnicode,
    InsertUnicodeView,
    UpdatingCollectionView
) {
    var InsertUnicodesView = Backbone.View.extend(
  /** @lends InsertUnicodesView.prototype */
  {
    /**
     * @class InsertUnicodesView
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      this.insertUnicodesView = new UpdatingCollectionView({
        collection : this.model,
        childViewConstructor : InsertUnicodeView,
        childViewTagName : "span",
      });
    },

    /**
     * Events that the InsertUnicode is listening to and their handlers.
     */
    events : {
      "click .add-unicode" : "insertNewUnicode",
    },

    // classname : "insert-unicode",

    template : Handlebars.templates.insert_unicodes,

    render : function() {

      // Display the InsertUnicodesView
      this.setElement($("#insert-unicode"));
      $(this.el).html(this.template({}));

      //Updating Collection View Rendering
      this.insertUnicodesView.el = this.$("#unicodes");
      this.insertUnicodesView.render();

      return this;
    },

    /**
     * Change the model's state.
     */
    updateUnicode : function() {
      Utils.debug("Updated unicode to "
          + this.$el.children(".insert-unicode-input").val());
      this.model.set("insertUnicode", this.$el
          .children(".insert-unicode-input").val());
    },
    /**
     * Adds a new unicode to the user's unicode collection
     */
    insertNewUnicode : function() {
      var m = new InsertUnicode({
        "symbol" : this.$el.children(".insert-unicode-input").val(),
      });
      app.get("authentication").get("userPrivate").get("prefs").get("unicodes")
          .add(m);
    },

    dragSrcEl : null,
    /**
     * http://www.html5rocks.com/en/tutorials/dnd/basics/
     * 
     * @param e
     */
    handleDragStart : function(e) {
      // Target (this) element is the source node.
      this.classList.add("halfopacity");
      window.appView.insertUnicodeView.dragSrcEl = this;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);
    }
  });
  return InsertUnicodesView;
});
