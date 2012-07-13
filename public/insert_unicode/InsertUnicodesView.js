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
        collection           :  this.model,
        childViewConstructor : InsertUnicodeView,
        childViewTagName     : "span",
      });
     
    },

    /**
     * Events that the InsertUnicode is listening to and their handlers.
     */
    events : {
      "click .add-unicode" : "insertNewUnicode"
    },

  //  classname : "insert-unicode",

    template : Handlebars.templates.insert_unicodes,

    render : function() {

      // Display the InsertUnicodesView
      this.setElement($("#insert-unicode"));
      $(this.el).html(this.template({}));
      
      this.insertUnicodesView.el = this.$("#unicodes");
      this.insertUnicodesView.render();

      return this;
    },
    
    /**
     * Change the model's state.
     */
    updateUnicode : function() {
      Utils.debug("Updated unicode to " + this.$el.children(".insert-unicode-input").val());
      this.model.set("insertUnicode", this.$el.children(".insert-unicode-input").val());
    },
    insertNewUnicode : function() {
      var m = new InsertUnicode({
        "symbol" : this.$el.children(".insert-unicode-input").val(),
      });
      app.get("authentication").get("userPrivate").get("prefs").get("unicodes").add(m);

    },

  });

  return InsertUnicodesView;
});
