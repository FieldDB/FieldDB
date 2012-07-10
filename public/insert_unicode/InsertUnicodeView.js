define([
    "backbone", 
    "handlebars", 
    "insert_unicode/InsertUnicode"
], function(Backbone,
    Handlebars,
    insert_unicodeTemplate,
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

    classname : "insert-unicode",

    template : Handlebars.templates.insert_unicode,

    render : function() {

      // Display the InsertUnicodeView
      this.setElement($("#insert-unicode"));
      $(this.el).html(this.template(this.model.toJSON()));

      return this;
    },
  });

  return InsertUnicodeView;
});
