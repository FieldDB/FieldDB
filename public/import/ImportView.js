define( [ 
    "use!backbone",
    "use!handlebars",
    "import/Import",
    "text!import/import.handlebars"
], function(Backbone,Handlebars, Import,importTemplate) {
  var ImportView = Backbone.View.extend({
    tagName : "div",
    className : "import",
    model: Import,
    
    template: Handlebars.compile(importTemplate),

    render : function() {
    
      this.setElement("#import-embedded");
      $(this.el).html(this.template(this.model.toJSON()));
       
   
//      var template = '<a href="#todo/{{id}}">' + '<h2>{{title}}</h2></a>';
//      var output = template.replace("{{id}}", this.model.id).replace(
//          "{{title}}", this.model.get('title'));
//      $(this.el).html(output);
//      if (this.model.get('done')) {
//        this.$("a").addClass("done");
//      }
      return this;
    }
  });
  return ImportView;
});