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
      "click .add-unicode" : "insertNewUnicodeSymbol",
      "keyup .insert-unicode-input" : function(e) {
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if (code == 13) {
          this.insertNewUnicodeSymbol()
        }
      },
      "keyup .insert-unicode-tipa-input" : function(e) {
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if (code == 13) {
          this.insertNewUnicodeSymbol()
        }
      }
    },

    template : Handlebars.templates.insert_unicodes,

    render : function() {
      // Display the InsertUnicodesView
      this.setElement($("#insert-unicode"));
      $(this.el).html(this.template({}));

      //Updating Collection View Rendering
      this.insertUnicodesView.el = this.$("#unicodes");
      this.insertUnicodesView.render();

        $(this.el).find(".unicode-symbol").each(function(index, item) {
          this.addEventListener('dragstart', window.appView.insertUnicodesView.handleDragStart, false);
        });
      
      return this;
    },
    
    /**
     * Adds a new unicode to the user's unicode collection
     */
    insertNewUnicodeSymbol : function() {
      var m = new InsertUnicode({
        "symbol" : this.$el.find(".insert-unicode-input").val(),
        "tipa" :  this.$el.find(".insert-unicode-tipa-input").val()
      });
      app.get("authentication").get("userPrivate").get("prefs").get("unicodes").add(m);
      
      // Clear the textfields
      this.$el.find(".insert-unicode-input").val("");
      this.$el.find(".insert-unicode-tipa-input").val("");
    },

    dragSrcEl : null,
    
    /**
     * http://www.html5rocks.com/en/tutorials/dnd/basics/
     * 
     * @param e
     */
    handleDragStart : function(e) {
      // Target (this) element is the source node.
      this.classList.remove("halfopacity");
//      var u = window.app.get("authentication").get("userPrivate").get("prefs").get("unicodes").where({symbol: this.innerHTML});
      //TODO useCount++ increase the user count on that item.
      
      //if not already dragging, do a drag start
      if(window.appView.insertUnicodesView.dragSrcEl == null){
        window.appView.insertUnicodesView.dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
      }
    }
  });
  return InsertUnicodesView;
});
