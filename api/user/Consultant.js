var Speaker = require('./Speaker').Speaker;

/**
 *
 * @class The Consultant (commonly refered to as a 'language consultant')
 * is a type of Speaker with any additional fields or metadata that a
 * team might use to to cluster consultants into dialects or variations.
 *
 * A consultant might also be associated to a user. In this case a consultant
 * has the same information as a user plus extra, some info (e.g. date of birth)
 * which must be kept confidential. Consultant's gravatar are default
 * unless he/she wants to be public associated with/his username.
 * Consultants which are also users have permissions about the
 * level of access to the data (read only, add/edit).
 *
 *
 * @name  Consultant
 * @extends Speaker
 * @constructs
 */
var Consultant = function Consultant(options) {
  this.debug("Constructing Consultant: ", options);
  Speaker.apply(this, arguments);
};

Consultant.defaults = Speaker.defaults;

Consultant.prototype = Object.create(Speaker.prototype, /** @lends Consultant.prototype */ {
  constructor: {
    value: Consultant
  }

});
exports.Consultant = Consultant;
