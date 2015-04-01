// using FieldDBObject straight.
//
// var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

// var Document = function Document(options) {
//   // if(!this._fieldDBtype){
//   // 	this._fieldDBtype = "Document";
//   // }
//   this.debug("In Document ", options);
//   FieldDBObject.apply(this, arguments);
// };

// Document.fieldDBtype = "Document";
// Document.prototype = Object.create(FieldDBObject.prototype, /** @lends Document.prototype */ {
//   constructor: {
//     value: Document
//   },

//   fieldDBtype: {
//     get: function() {
//       this.debug("getting fieldDBtype");
//       if (!this._fieldDBtype) {
//         // this._fieldDBtype = this.guessType(this);
//       }
//       return this._fieldDBtype || "";
//     },
//     set: function(value) {
//       this.debug("setting fieldDBtype");
//       if (value !== this._fieldDBtype) {
//         this.warn("Overriding fieldDBtype " + this._fieldDBtype + " to the incoming " + value);
//         this._fieldDBtype = value;
//       }
//     }
//   }

//   }

// });

// exports.Document = Document;
