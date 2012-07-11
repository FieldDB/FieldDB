define([
    "backbone", 
    "handlebars", 
    "insert_unicode/InsertUnicode"
], function(Backbone,
    Handlebars,
    InsertUnicode) {
    var InsertUnicodeView = Backbone.View.extend(
  /** @lends InsertUnicodeView.prototype */
  {
    /**
     * @class InsertUnicodeView
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
    },

    model : InsertUnicode,
    /**
     * Events that the InsertUnicode is listening to and their handlers.
     */
    events : {
      "click .add-unicode" : "insertNewUnicode"
    },

    classname : "insert-unicode",

    template : Handlebars.templates.insert_unicode,

    render : function() {

      // Display the InsertUnicodeView
      this.setElement($("#insert-unicode"));
      $(this.el).html(this.template(this.model.toJSON()));

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

  return InsertUnicodeView;
});
