(function(exports) {

  var FieldDBObject = require('fielddb/api/FieldDBObject').FieldDBObject;

  var Document = function Document(options) {
    this.debug("In Document ", options);
    FieldDBObject.apply(this, arguments);
  };

  Document.prototype = Object.create(FieldDBObject.prototype, /** @lends Document.prototype */ {
    constructor: {
      value: Document
    }
  });

  exports.Document = Document;

})(typeof exports === 'undefined' ? this['Document'] = {} : exports);
