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
      //$(".locale_LaTeX_Code").html(chrome.i18n.getMessage("locale_LaTeX_Code"));
      //$(".locale_Unicode_Instructions").html(chrome.i18n.getMessage("locale_Unicode_Instructions"));
      //$(".locale_Keyboard_Shortcuts").html(chrome.i18n.getMessage("locale_Keyboard_Shortcuts"));
      //$(".locale_Remove_Unicode").html(chrome.i18n.getMessage("locale_Remove_Unicode"));
      //$(".locale_Paste_Type_Unicode_Symbol_Placeholder").attr("placeholder", chrome.i18n.getMessage("locale_Paste_Type_Unicode_Symbol_Placeholder"));
      //$(".locale_TIPA_shortcut").attr("placeholder", chrome.i18n.getMessage("locale_TIPA_shortcut"));



      
      return this;
    },
    
    removeUnicode : function(){
      window.app.get("authentication").get("userPrivate").get("prefs").get("unicodes").remove(this.model);    
    }
  });
  return InsertUnicodeView;
});
