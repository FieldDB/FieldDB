// parse models
console.log("Overriding backbone parse to allow for recursive objects.");
Backbone.Model.prototype.parse = function(response) {
//  var oldParse = Backbone.Model.prototype.parse;

  //parse internal models (Added by FieldDB team)
  if (response.ok === undefined) {
    for (var key in this.model) {
      var embeddedClass = this.model[key];
      var embeddedData = response[key];
      response[key] = new embeddedClass(embeddedData, {parse:true});
    }
  }
//  oldParse.call(this, response);
};