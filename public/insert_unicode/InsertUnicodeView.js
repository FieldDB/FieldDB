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
    events : {
      "click .edit-tipa-input" : function(e){
        //dont collapse the dropdown
        e.stopPropagation();
        return false;
      },
      "click .remove-unicode" : "removeUnicode",
      "keyup .edit-tipa-input" : function(e){
        this.model.set("tipa", $(e.target).val());
      }
    },
    model : InsertUnicode,
    template : Handlebars.templates.insert_unicode,
    tagName: "span",
    
    render : function() {
      Utils.debug("INSERT UNICODE render");
      
      $(this.el).html(this.template(this.model.toJSON()));
      //localization
      $(".LaTeX_Code").html(chrome.i18n.getMessage("LaTeX_Code"));
      $(".Unicode_Instructions").html(chrome.i18n.getMessage("Unicode_Instructions"));
      $(".Keyboard_Shortcuts").html(chrome.i18n.getMessage("Keyboard_Shortcuts"));
      $(".Remove_Unicode").html(chrome.i18n.getMessage("Remove_Unicode"));



      
      return this;
    },
    
    removeUnicode : function(){
      window.app.get("authentication").get("userPrivate").get("prefs").get("unicodes").remove(this.model);    
    }
  });
  return InsertUnicodeView;
});
