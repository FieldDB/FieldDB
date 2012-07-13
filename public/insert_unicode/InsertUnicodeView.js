define([
    "backbone", 
    "handlebars", 
    "insert_unicode/InsertUnicode"
], function(Backbone,
    Handlebars,
    InsertUnicode) {
    var InsertUnicodeView = Backbone.View.extend(
  /** @lends InsertUnicodesView.prototype */
  {
    /**
     * @class InsertUnicodesView
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("INSERT UNICODE VIEW init");

    },

    model : InsertUnicode,
    /**
     * Events that the InsertUnicode is listening to and their handlers.
     */
    events : {
     
    },

    template : Handlebars.templates.insert_unicode,
    tagName: "span",
    className: "badge",
    
    render : function() {
      Utils.debug("INSERT UNICODE render");
      
      $(this.el).html(this.template(this.model.toJSON()));
      this.el.draggable= "true";
      this.el.addEventListener('dragover', window.appView.insertUnicodeView.handleDragStart, false);
      $(this.el).after(" ");
      
      window.setTimeout(function(){
        $(".badge").after(" ");
      }, 500);
      
      return this;
    },
  });
  return InsertUnicodeView;
});
