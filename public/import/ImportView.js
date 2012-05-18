define("import/ImportView", [ 
    "use!backbone"
], function(Backbone) {
  var ImportView = Backbone.View.extend({
    tagName : "div",
    className : "import",
    render : function() {
      var template = '<a href="#todo/{{id}}">' + '<h2>{{title}}</h2></a>';
      var output = template.replace("{{id}}", this.model.id).replace(
          "{{title}}", this.model.get('title'));
      $(this.el).html(output);
      if (this.model.get('done')) {
        this.$("a").addClass("done");
      }
      return this;
    }
  });
  return ImportView;
});